import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Pregunta = sequelize.define('Pregunta', {
    idPregunta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'idPregunta'
    },
    textoPregunta: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'TextoPregunta'
    }
}, {
    tableName: 'Pregunta',
    timestamps: false
});

export default Pregunta;
