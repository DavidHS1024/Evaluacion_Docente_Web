import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * Define el modelo Usuario. Es la tabla base para autenticación,
 * a partir de la cual se extenderán los roles de Docente y Administrador.
 */

const Usuario = sequelize.define('Usuario', {
    id: { // Usamos 'id' estándar para la clave primaria
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    // Añadimos un campo de rol para determinar los permisos
    rol: {
        type: DataTypes.ENUM('estudiante', 'docente', 'administrador'),
        allowNull: false,
        defaultValue: 'estudiante'
    },
    nombre: { // Convención camelCase
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    apellido: { // Convención camelCase
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    email: { // Convención camelCase
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true, // Único para el login
    },
    contrasenaHash: { // Convención camelCase
        type: DataTypes.STRING(255), // Hash de la contraseña (e.g., bcrypt)
        allowNull: false,
        field: 'contrasena_hash' // Mapeo a snake_case en la BD si se desea
    },
}, {
    tableName: 'Usuario',
    freezeTableName: true, // Evita la pluralización
    timestamps: true, // Recomendado para auditoría (createdAt, updatedAt)
    // El campo FechaRegistro lo proporciona 'timestamps: true' por defecto como 'createdAt'
});

export default Usuario;