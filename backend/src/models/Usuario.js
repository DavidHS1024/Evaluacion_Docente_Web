import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Usuario = sequelize.define('Usuario', {
    idUsuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'idUsuario'
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'Nombre'
    },
    apellido: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'Apellido'
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        field: 'Email'
    },
    contrasenaHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'Contrasena_Hash'
    },
    fechaRegistro: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'FechaRegistro'
    }
}, {
    tableName: 'Usuario',
    timestamps: false 
});

export default Usuario;