import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Docente = sequelize.define('Docente', {
    idUsuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'idUsuario'
    },
    codigoDocente: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        field: 'CodigoDocente'
    },
    clasificacion: {
        type: DataTypes.STRING(40),
        allowNull: true,
        field: 'Clasificacion'
    }
}, {
    tableName: 'Docente',
    timestamps: false
});

export default Docente;