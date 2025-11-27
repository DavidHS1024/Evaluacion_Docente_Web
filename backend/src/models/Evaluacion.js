import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Evaluacion = sequelize.define('Evaluacion', {
    idEvaluacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'idEvaluacion'
    },
    detalleMatriculaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true, // Un alumno solo evalúa una vez por curso/profesor
        field: 'DetalleMatricula_id'
    },
    fechaEvaluacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'FechaEvaluacion'
    }
}, {
    tableName: 'Evaluacion',
    timestamps: false
});

export default Evaluacion;