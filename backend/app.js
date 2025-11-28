import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { connectDB, sequelize } from './src/config/database.js';

// --- IMPORTACIÓN DE MODELOS ---
import Usuario from './src/models/Usuario.js';
import Estudiante from './src/models/Estudiante.js';
import Docente from './src/models/Docente.js';
import Administrador from './src/models/Administrador.js';
import Curso from './src/models/Curso.js';
import AsignacionDocente from './src/models/AsignacionDocente.js';
import Matricula from './src/models/Matricula.js';
import DetalleMatricula from './src/models/DetalleMatricula.js';
import Evaluacion from './src/models/Evaluacion.js';
import Pregunta from './src/models/Pregunta.js';
import Respuesta from './src/models/Respuesta.js';

// --- DEFINICIÓN DE RELACIONES (ASSOCIATIONS) ---

// 1. Usuarios y Roles
Usuario.hasOne(Estudiante, { foreignKey: 'idUsuario' });
Estudiante.belongsTo(Usuario, { foreignKey: 'idUsuario' });

Usuario.hasOne(Docente, { foreignKey: 'idUsuario' });
Docente.belongsTo(Usuario, { foreignKey: 'idUsuario' });

Usuario.hasOne(Administrador, { foreignKey: 'idUsuario' });
Administrador.belongsTo(Usuario, { foreignKey: 'idUsuario' });

// 2. Docente y Cursos
Docente.hasMany(AsignacionDocente, { foreignKey: 'docenteId' });
AsignacionDocente.belongsTo(Docente, { foreignKey: 'docenteId' });

Curso.hasMany(AsignacionDocente, { foreignKey: 'cursoId' });
AsignacionDocente.belongsTo(Curso, { foreignKey: 'cursoId' });

// 3. Matrícula y Estudiante
Estudiante.hasMany(Matricula, { foreignKey: 'estudianteId' });
Matricula.belongsTo(Estudiante, { foreignKey: 'estudianteId' });

// 4. Detalle de Matrícula
Matricula.hasMany(DetalleMatricula, { foreignKey: 'matriculaId' });
DetalleMatricula.belongsTo(Matricula, { foreignKey: 'matriculaId' });

AsignacionDocente.hasMany(DetalleMatricula, { foreignKey: 'asignacionId' });
DetalleMatricula.belongsTo(AsignacionDocente, { foreignKey: 'asignacionId' });

// 5. Evaluación y Respuestas
DetalleMatricula.hasOne(Evaluacion, { foreignKey: 'detalleMatriculaId' });
Evaluacion.belongsTo(DetalleMatricula, { foreignKey: 'detalleMatriculaId' });

Evaluacion.hasMany(Respuesta, { foreignKey: 'evaluacionId' });
Respuesta.belongsTo(Evaluacion, { foreignKey: 'evaluacionId' });

Pregunta.hasMany(Respuesta, { foreignKey: 'preguntaId' });
Respuesta.belongsTo(Pregunta, { foreignKey: 'preguntaId' });


const app = express();
app.use(cors());
app.use(express.json());

// --- INICIO DEL SERVIDOR ---
async function startServer() {
    try {
        await connectDB();
        await sequelize.sync({ alter: false });
        console.log('✅ Base de datos MySQL conectada y modelos sincronizados.');

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`🚀 Servidor backend escuchando en puerto ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Error crítico al iniciar servidor:', error);
    }
}

// --- RUTAS API ---

// 1. LOGIN
app.post('/api/login', async (req, res) => {
    const { role, code, dni, password } = req.body;

    try {
        let roleData;

        if (role === 'student') {
            roleData = await Estudiante.findOne({
                where: { codigoEstudiante: code },
                include: [{ model: Usuario }]
            });
        } else if (role === 'professor') {
            roleData = await Docente.findOne({
                where: { codigoDocente: dni },
                include: [{ model: Usuario }]
            });
        } else if (role === 'admin') {
            const usuarioAdmin = await Usuario.findOne({ where: { email: dni } });
            if (usuarioAdmin) {
                roleData = await Administrador.findOne({ where: { idUsuario: usuarioAdmin.idUsuario }, include: [Usuario] });
            }
        }

        if (!roleData || !roleData.Usuario) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const match = await bcrypt.compare(password, roleData.Usuario.contrasenaHash);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        res.json({
            success: true,
            user: {
                role,
                code: role === 'student' ? roleData.codigoEstudiante : null,
                dni: role === 'professor' ? roleData.codigoDocente : null,
                name: `${roleData.Usuario.nombre} ${roleData.Usuario.apellido}`,
                idUsuario: roleData.Usuario.idUsuario
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// 2. OBTENER CURSOS DEL ESTUDIANTE
app.get('/student/courses', async (req, res) => {
    const studentCode = req.headers['x-student-code'];

    if (!studentCode) {
        return res.status(400).json({ message: 'Falta código de estudiante' });
    }

    try {
        const estudiante = await Estudiante.findOne({ where: { codigoEstudiante: studentCode } });
        if (!estudiante) return res.status(404).json({ message: 'Estudiante no encontrado' });

        const matriculas = await Matricula.findAll({
            where: { estudianteId: estudiante.idUsuario },
            include: [{
                model: DetalleMatricula,
                include: [{
                    model: AsignacionDocente,
                    include: [
                        { model: Curso },
                        { model: Docente, include: [Usuario] }
                    ]
                }, {
                    model: Evaluacion,
                    required: false
                }]
            }]
        });

        let courses = [];
        matriculas.forEach(mat => {
            mat.DetalleMatriculas.forEach(det => {
                const asig = det.AsignacionDocente;
                courses.push({
                    id: asig.cursoId,
                    detalleId: det.idDetalleMatricula,
                    name: asig.Curso.nombreCurso,
                    code: asig.Curso.codigoCurso,
                    teacher: `${asig.Docente.Usuario.nombre} ${asig.Docente.Usuario.apellido}`,
                    responded: !!det.Evaluacion,
                    isSurveyActive: true 
                });
            });
        });

        res.json(courses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al obtener cursos' });
    }
});

// 3. ENVIAR ENCUESTA
app.post('/api/submit', async (req, res) => {
    const { student: studentCode, courseId, answers } = req.body;

    try {
        const estudiante = await Estudiante.findOne({ where: { codigoEstudiante: studentCode } });
        if (!estudiante) return res.status(404).json({ message: 'Estudiante inválido' });

        const detalle = await DetalleMatricula.findOne({
            include: [
                {
                    model: Matricula,
                    where: { estudianteId: estudiante.idUsuario }
                },
                {
                    model: AsignacionDocente,
                    where: { cursoId: courseId }
                }
            ]
        });

        if (!detalle) {
            return res.status(404).json({ success: false, message: 'No estás matriculado en este curso' });
        }

        const existing = await Evaluacion.findOne({ where: { detalleMatriculaId: detalle.idDetalleMatricula } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Ya enviaste esta encuesta previamente' });
        }

        await sequelize.transaction(async (t) => {
            const nuevaEvaluacion = await Evaluacion.create({
                detalleMatriculaId: detalle.idDetalleMatricula
            }, { transaction: t });

            const respuestasData = [
                { preguntaId: 1, valorNumerico: Number(answers.p1) },
                { preguntaId: 2, valorNumerico: Number(answers.p2) },
                { preguntaId: 3, valorNumerico: Number(answers.p3) },
                { preguntaId: 4, valorNumerico: Number(answers.p4) },
                { preguntaId: 5, valorTexto: answers.comment || '' }
            ];

            const respuestasFinales = respuestasData.map(r => ({
                ...r,
                evaluacionId: nuevaEvaluacion.idEvaluacion
            }));

            await Respuesta.bulkCreate(respuestasFinales, { transaction: t });
        });

        res.json({ success: true, message: 'Encuesta guardada exitosamente' });

    } catch (err) {
        console.error('Error al guardar encuesta:', err);
        res.status(500).json({ success: false, message: 'Error interno al guardar' });
    }
});

// 4. REPORTE DEL DOCENTE (Corregido para evitar error null)
app.get('/teacher/my-reports', async (req, res) => {
    const dni = req.headers['x-teacher-dni'];
    if (!dni) return res.status(401).json({ message: 'Falta DNI' });

    try {
        const docente = await Docente.findOne({ where: { codigoDocente: dni } });
        if (!docente) return res.status(403).json({ message: 'Docente no encontrado' });

        const asignaciones = await AsignacionDocente.findAll({
            where: { docenteId: docente.idUsuario },
            include: [
                { model: Curso },
                { 
                    model: DetalleMatricula,
                    include: [{ model: Evaluacion, include: [Respuesta] }]
                }
            ]
        });

        const reports = asignaciones.map(asig => {
            let totalP1 = 0, totalP2 = 0, totalP3 = 0, totalP4 = 0;
            let count = 0;
            let enrolled = asig.DetalleMatriculas.length;

            asig.DetalleMatriculas.forEach(det => {
                // --- CORRECCIÓN CRÍTICA: Validar si existe evaluación ---
                if (det.Evaluacion && det.Evaluacion.Respuestas) {
                    count++;
                    det.Evaluacion.Respuestas.forEach(resp => {
                        if (resp.preguntaId === 1) totalP1 += resp.valorNumerico;
                        if (resp.preguntaId === 2) totalP2 += resp.valorNumerico;
                        if (resp.preguntaId === 3) totalP3 += resp.valorNumerico;
                        if (resp.preguntaId === 4) totalP4 += resp.valorNumerico;
                    });
                }
            });

            return {
                courseId: asig.cursoId,
                courseName: asig.Curso.nombreCurso,
                participationRate: enrolled ? ((count / enrolled) * 100).toFixed(1) : 0,
                count,
                avg_p1: count ? (totalP1 / count) : 0,
                avg_p2: count ? (totalP2 / count) : 0,
                avg_p3: count ? (totalP3 / count) : 0,
                avg_p4: count ? (totalP4 / count) : 0,
                avg_general: count ? ((totalP1 + totalP2 + totalP3 + totalP4) / (count * 4)) : 0
            };
        });

        res.json(reports);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al generar reporte' });
    }
});

// 5. REPORTE GENERAL PARA ESTUDIANTES (Restaurado para SQL)
app.get('/api/reports', async (req, res) => {
    try {
        // Obtener todos los cursos con asignación y sus evaluaciones
        const asignaciones = await AsignacionDocente.findAll({
            include: [
                { model: Curso },
                { model: Docente, include: [Usuario] },
                { 
                    model: DetalleMatricula,
                    include: [{ model: Evaluacion, include: [Respuesta] }]
                }
            ]
        });

        const reportData = asignaciones.map(asig => {
            let totalP1 = 0, totalP2 = 0, totalP3 = 0, totalP4 = 0;
            let count = 0;
            let enrolled = asig.DetalleMatriculas.length;

            asig.DetalleMatriculas.forEach(det => {
                if (det.Evaluacion && det.Evaluacion.Respuestas) {
                    count++;
                    det.Evaluacion.Respuestas.forEach(resp => {
                        if (resp.preguntaId === 1) totalP1 += resp.valorNumerico;
                        if (resp.preguntaId === 2) totalP2 += resp.valorNumerico;
                        if (resp.preguntaId === 3) totalP3 += resp.valorNumerico;
                        if (resp.preguntaId === 4) totalP4 += resp.valorNumerico;
                    });
                }
            });

            const avg_p1 = count ? totalP1 / count : 0;
            const avg_p2 = count ? totalP2 / count : 0;
            const avg_p3 = count ? totalP3 / count : 0;
            const avg_p4 = count ? totalP4 / count : 0;
            const avg_general = count ? (avg_p1 + avg_p2 + avg_p3 + avg_p4) / 4 : 0;

            return {
                courseId: asig.cursoId,
                courseName: asig.Curso.nombreCurso,
                teacher: `${asig.Docente.Usuario.nombre} ${asig.Docente.Usuario.apellido}`,
                participationRate: enrolled ? ((count / enrolled) * 100).toFixed(1) : 0,
                avg_p1: avg_p1.toFixed(2),
                avg_p2: avg_p2.toFixed(2),
                avg_p3: avg_p3.toFixed(2),
                avg_p4: avg_p4.toFixed(2),
                avg_general: avg_general.toFixed(2)
            };
        });

        res.json(reportData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al cargar reportes generales' });
    }
});

// 6. PERIODO
app.get('/api/period', (req, res) => {
    res.json({
        startDate: "2024-01-01",
        endDate: "2025-12-31",
        isActive: true
    });
});

startServer();