import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Estudiante = sequelize.define('Estudiante', {
    idUsuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'idUsuario'
    },
    codigoEstudiante: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        field: 'CodigoEstudiante'
    }
}, {
    tableName: 'Estudiante',
    timestamps: false
});

export default Estudiante;