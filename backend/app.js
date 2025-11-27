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

// 2. Docente y Cursos (A través de AsignacionDocente)
Docente.hasMany(AsignacionDocente, { foreignKey: 'docenteId' });
AsignacionDocente.belongsTo(Docente, { foreignKey: 'docenteId' });

Curso.hasMany(AsignacionDocente, { foreignKey: 'cursoId' });
AsignacionDocente.belongsTo(Curso, { foreignKey: 'cursoId' });

// 3. Matrícula y Estudiante
Estudiante.hasMany(Matricula, { foreignKey: 'estudianteId' });
Matricula.belongsTo(Estudiante, { foreignKey: 'estudianteId' });

// 4. Detalle de Matrícula (Conecta Matrícula con la Asignación del Docente)
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

// --- FUNCIÓN PARA POBLAR PREGUNTAS (SEED) ---
async function inicializarPreguntas() {
    try {
        const count = await Pregunta.count();
        if (count === 0) {
            console.log('⚠️ No hay preguntas en la BD. Insertando preguntas por defecto...');
            await Pregunta.bulkCreate([
                { idPregunta: 1, textoPregunta: '¿El docente explica con claridad los temas del curso?' },
                { idPregunta: 2, textoPregunta: '¿El docente fomenta la participación de los estudiantes?' },
                { idPregunta: 3, textoPregunta: '¿Cumple con los horarios establecidos para las clases?' },
                { idPregunta: 4, textoPregunta: '¿El docente demuestra dominio del tema?' },
                { idPregunta: 5, textoPregunta: 'Comentarios adicionales' }
            ]);
            console.log('✅ Preguntas insertadas correctamente.');
        }
    } catch (error) {
        console.error('Error al inicializar preguntas:', error);
    }
}

// --- INICIO DEL SERVIDOR ---
async function startServer() {
    try {
        await connectDB();
        // Sincronizar modelos: 'alter: true' actualiza las tablas si hay cambios, sin borrar datos.
        await sequelize.sync({ alter: true });
        console.log('✅ Base de datos MySQL conectada y modelos sincronizados.');

        // Asegurar que existan preguntas
        await inicializarPreguntas();

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

        // Buscar según el rol
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
            // Para admin, asumimos login por Email o DNI si lo agregaste al modelo Usuario.
            // Aquí buscamos un usuario administrador genérico o vinculado
            // Ajusta esta lógica según cómo registres admins en tu BD
            const usuarioAdmin = await Usuario.findOne({ where: { email: dni } }); // Usando email como ejemplo temporal
            if (usuarioAdmin) {
                roleData = await Administrador.findOne({ where: { idUsuario: usuarioAdmin.idUsuario }, include: [Usuario] });
            }
        }

        if (!roleData || !roleData.Usuario) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        // Verificar contraseña
        const match = await bcrypt.compare(password, roleData.Usuario.contrasenaHash);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
        }

        // Responder con datos para el frontend
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
    // El frontend DEBE enviar este header (lo configuraremos en el paso 5)
    const studentCode = req.headers['x-student-code'];

    if (!studentCode) {
        return res.status(400).json({ message: 'Falta código de estudiante (header x-student-code)' });
    }

    try {
        const estudiante = await Estudiante.findOne({ where: { codigoEstudiante: studentCode } });
        if (!estudiante) return res.status(404).json({ message: 'Estudiante no encontrado' });

        // Buscamos matrículas -> detalles -> asignación -> curso y docente
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
                    model: Evaluacion, // Incluimos evaluación para saber si ya respondió
                    required: false
                }]
            }]
        });

        let courses = [];
        matriculas.forEach(mat => {
            mat.DetalleMatriculas.forEach(det => {
                const asig = det.AsignacionDocente;
                courses.push({
                    id: asig.cursoId, // ID del Curso (para mostrar)
                    detalleId: det.idDetalleMatricula, // ID Clave para enviar la encuesta
                    name: asig.Curso.nombreCurso,
                    code: asig.Curso.codigoCurso,
                    teacher: `${asig.Docente.Usuario.nombre} ${asig.Docente.Usuario.apellido}`,
                    responded: !!det.Evaluacion, // true si existe evaluación
                    isSurveyActive: true // Aquí podrías validar fechas si lo deseas
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
        // 1. Identificar al estudiante
        const estudiante = await Estudiante.findOne({ where: { codigoEstudiante: studentCode } });
        if (!estudiante) return res.status(404).json({ message: 'Estudiante inválido' });

        // 2. Encontrar el registro exacto de matrícula para este curso
        // Buscamos un DetalleMatricula que pertenezca a una Matricula de este estudiante
        // y cuya AsignacionDocente corresponda al curso enviado.
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

        // 3. Verificar si ya respondió
        const existing = await Evaluacion.findOne({ where: { detalleMatriculaId: detalle.idDetalleMatricula } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Ya enviaste esta encuesta previamente' });
        }

        // 4. Guardar Evaluación y Respuestas (Transacción para asegurar integridad)
        await sequelize.transaction(async (t) => {
            // Crear cabecera de evaluación
            const nuevaEvaluacion = await Evaluacion.create({
                detalleMatriculaId: detalle.idDetalleMatricula
            }, { transaction: t });

            // Preparar respuestas
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

            // Insertar todas las respuestas
            await Respuesta.bulkCreate(respuestasFinales, { transaction: t });
        });

        res.json({ success: true, message: 'Encuesta guardada exitosamente' });

    } catch (err) {
        console.error('Error al guardar encuesta:', err);
        res.status(500).json({ success: false, message: 'Error interno al guardar' });
    }
});

// 3.5. REPORTE DEL DOCENTE
app.get('/teacher/my-reports', async (req, res) => {
    const dni = req.headers['x-teacher-dni'];
    if (!dni) return res.status(401).json({ message: 'Falta DNI' });

    try {
        const docente = await Docente.findOne({ where: { codigoDocente: dni } });
        if (!docente) return res.status(403).json({ message: 'Docente no encontrado' });

        // Obtener cursos asignados a este docente
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
                if (det.Evaluacion) {
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
                avg_p4: count ? (totalP4 / count) : 0
            };
        });

        res.json(reports);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al generar reporte' });
    }
});

// 4. PERIODO DE EVALUACIÓN (Endpoint simple para que el frontend no falle)
app.get('/api/period', (req, res) => {
    // En una versión futura, esto vendría de una tabla 'Configuracion'
    res.json({
        startDate: "2024-01-01",
        endDate: "2025-12-31",
        isActive: true
    });
});

// Endpoint de prueba para ver si el server vive
app.get('/', (req, res) => {
    res.send('Servidor Backend Funcionando 🚀');
});

startServer();