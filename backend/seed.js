import 'dotenv/config';
import bcrypt from 'bcrypt';
import { connectDB, sequelize } from './src/config/database.js';

// Importar modelos
import Usuario from './src/models/Usuario.js';
import Estudiante from './src/models/Estudiante.js';
import Docente from './src/models/Docente.js';
import Curso from './src/models/Curso.js';
import AsignacionDocente from './src/models/AsignacionDocente.js';
import Matricula from './src/models/Matricula.js';
import DetalleMatricula from './src/models/DetalleMatricula.js';
import Pregunta from './src/models/Pregunta.js';

async function seed() {
try {
        await connectDB();

        // --- CORRECCIÓN: Desactivar chequeo de llaves foráneas temporalmente ---
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
        
        await sequelize.sync({ force: true }); 
        
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { raw: true });
        // -----------------------------------------------------------------------

        console.log('🔄 Base de datos reseteada y sincronizada.');
        // 1. Crear Preguntas
        await Pregunta.bulkCreate([
            { textoPregunta: '¿El docente explica con claridad los temas del curso?' },
            { textoPregunta: '¿El docente fomenta la participación de los estudiantes?' },
            { textoPregunta: '¿Cumple con los horarios establecidos para las clases?' },
            { textoPregunta: '¿El docente demuestra dominio del tema?' },
            { textoPregunta: 'Comentarios adicionales' }
        ]);

        // 2. Crear Usuarios (Contraseña para todos: "123456")
        const passwordHash = await bcrypt.hash('123456', 10);

        // -- Crear Estudiante
        const userEstudiante = await Usuario.create({
            nombre: 'Juan',
            apellido: 'Perez',
            email: 'juan.perez@unac.edu.pe',
            contrasenaHash: passwordHash
        });
        const estudiante = await Estudiante.create({
            idUsuario: userEstudiante.idUsuario,
            codigoEstudiante: '20240001' // 🔑 USAR ESTO PARA LOGIN ESTUDIANTE
        });

        // -- Crear Docente
        const userDocente = await Usuario.create({
            nombre: 'Pedro',
            apellido: 'Castillo',
            email: 'pedro.castillo@unac.edu.pe',
            contrasenaHash: passwordHash
        });
        const docente = await Docente.create({
            idUsuario: userDocente.idUsuario,
            codigoDocente: 'DOC001', // 🔑 USAR ESTO PARA LOGIN DOCENTE
            clasificacion: 'Principal'
        });

        // 3. Crear Curso
        const curso = await Curso.create({
            codigoCurso: 'SIST-101',
            nombreCurso: 'Ingeniería de Software I',
            estadoCurso: 1
        });

        // 4. Asignar Docente al Curso
        const asignacion = await AsignacionDocente.create({
            docenteId: docente.idUsuario,
            cursoId: curso.idCurso,
            periodo: '2025-A',
            grupo: 'G1'
        });

        // 5. Matricular Estudiante
        const matricula = await Matricula.create({
            estudianteId: estudiante.idUsuario,
            periodo: '2025-A'
        });

        // 6. Detalle Matrícula (Unir todo)
        await DetalleMatricula.create({
            matriculaId: matricula.idMatricula,
            asignacionId: asignacion.idAsignacion,
            estado: 'ACTIVO'
        });

        console.log('✅ ¡Datos de prueba insertados con éxito!');
        console.log('------------------------------------------------');
        console.log('🔑 CREDENCIALES DE PRUEBA:');
        console.log('🎓 ESTUDIANTE -> Código: 20240001 | Password: 123456');
        console.log('👨‍🏫 DOCENTE    -> DNI/Cod: DOC001   | Password: 123456');
        console.log('------------------------------------------------');

    } catch (error) {
        console.error('❌ Error al insertar datos:', error);
    } finally {
        process.exit();
    }
}

seed();