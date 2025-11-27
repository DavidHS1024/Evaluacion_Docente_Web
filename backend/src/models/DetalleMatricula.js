import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const DetalleMatricula = sequelize.define('DetalleMatricula', {
    idDetalleMatricula: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'idDetalleMatricula'
    },
    matriculaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'Matricula_idMatricula'
    },
    asignacionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'AsignacionDocente_idAsignacion'
    },
    estado: {
        type: DataTypes.ENUM('ACTIVO', 'RETIRADO'),
        defaultValue: 'ACTIVO',
        field: 'Estado'
    }
}, {
    tableName: 'DetalleMatricula',
    timestamps: false
});

export default DetalleMatricula;