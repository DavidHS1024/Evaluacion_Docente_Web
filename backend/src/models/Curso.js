import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

// Importamos Docente para definir la relación 1:N
import Docente from './Docente.js'; 
// Importamos Estudiante y Matricula para definir la relación N:M
import Estudiante from './Estudiante.js'; 
import Matricula from './Matricula.js'; 

const Curso = sequelize.define('Curso', {
    id: { // Usamos 'id' estándar
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    codigoCurso: { // Convención camelCase
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        field: 'codigo_curso'
    },
    nombreCurso: { // Convención camelCase
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'nombre_curso'
    },
    estadoCurso: { // Convención camelCase
        type: DataTypes.INTEGER, // Usamos INTEGER en lugar de TINYINT
        defaultValue: 1,
        allowNull: true,
        field: 'estado_curso'
    },
    // CLAVE FORÁNEA: Un curso pertenece a un solo docente (1:N)
    DocenteIdUsuario: {
        type: DataTypes.INTEGER,
        allowNull: true, // Permitimos NULL si un curso no está asignado temporalmente
        references: {
            model: 'Docente',
            key: 'idUsuario', // La PK en la tabla Docente
        },
        field: 'docente_id_usuario'
    },
}, {
    tableName: 'Curso',
    freezeTableName: true,
    timestamps: false,
});

// -----------------------------------------------------------------------------
// Definición de Asociaciones (Relaciones)
// -----------------------------------------------------------------------------

// 1. Relación 1:N con Docente (Un Docente tiene muchos Cursos)
Docente.hasMany(Curso, {
    foreignKey: 'DocenteIdUsuario',
    onDelete: 'SET NULL', // Si el docente se va, el curso queda sin asignar
});

Curso.belongsTo(Docente, {
    foreignKey: 'DocenteIdUsuario',
});

// 2. Relación N:M con Estudiante (Matrícula)
// Esto define la relación a través de la tabla intermedia 'Matricula'.
Curso.belongsToMany(Estudiante, {
    through: Matricula,
    foreignKey: 'courseId', // FK de Curso en la tabla Matricula
    as: 'EstudiantesMatriculados'
});

Estudiante.belongsToMany(Curso, {
    through: Matricula,
    foreignKey: 'studentCode', // FK de Estudiante en la tabla Matricula
    as: 'CursosMatriculados'
});


export default Curso;