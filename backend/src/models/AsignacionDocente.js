import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const AsignacionDocente = sequelize.define('AsignacionDocente', {
    idAsignacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'idAsignacion'
    },
    docenteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'Docente_idUsuario'
    },
    cursoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'Curso_idCurso'
    },
    periodo: {
        type: DataTypes.STRING(10),
        allowNull: false,
        field: 'Periodo'
    },
    grupo: {
        type: DataTypes.STRING(5),
        allowNull: false,
        field: 'Grupo'
    }
}, {
    tableName: 'AsignacionDocente',
    timestamps: false
});

export default AsignacionDocente;