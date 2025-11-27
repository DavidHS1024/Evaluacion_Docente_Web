import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Respuesta = sequelize.define('Respuesta', {
    idRespuesta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'idRespuesta'
    },
    evaluacionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'Evaluacion_idEvaluacion'
    },
    preguntaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'Pregunta_idPregunta'
    },
    valorNumerico: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'ValorNumerico'
    },
    valorTexto: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'ValorTexto'
    }
}, {
    tableName: 'Respuesta',
    timestamps: false
});

export default Respuesta;
