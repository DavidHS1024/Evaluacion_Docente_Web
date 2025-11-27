import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Usuario from './Usuario.js'; 

const Administrador = sequelize.define('Administrador', {
    // idUsuario es la clave primaria de Administrador y la clave foránea a Usuario
    idUsuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    // Cargo del administrador (permite NULL)
    cargo: { // Cambiado a camelCase
        type: DataTypes.STRING(50),
        allowNull: true,
    },
}, {
    tableName: 'Administrador',
    freezeTableName: true,
    timestamps: false,
});

// -----------------------------------------------------------------------------
// Definición de Asociaciones (Relación 1:1 con Usuario)
// -----------------------------------------------------------------------------

// Asociación 1:1 entre Usuario y Administrador.
Usuario.hasOne(Administrador, {
    foreignKey: 'idUsuario', 
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// La relación inversa (Administrador pertenece a Usuario)
Administrador.belongsTo(Usuario, {
    foreignKey: 'idUsuario',
});

export default Administrador;