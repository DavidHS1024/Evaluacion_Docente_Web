import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

// Importamos el modelo Usuario para poder definir la relación
import Usuario from './Usuario.js'; 

/**
 * @fileoverview Define el modelo Estudiante.
 * * La tabla Estudiante contiene el código único del estudiante y hereda la información
 * básica de la tabla Usuario (relación 1:1, donde la PK es también FK).
 */

const Estudiante = sequelize.define('Estudiante', {
    // idUsuario es la clave primaria de Estudiante y la clave foránea a Usuario
    idUsuario: {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        allowNull: false,
    },
    // Código único del estudiante (VARCHAR(20) UNIQUE)
    CodigoEstudiante: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
    },
}, {
    tableName: 'Estudiante',
    freezeTableName: true,
    timestamps: false,
});

// -----------------------------------------------------------------------------
// Definición de Asociaciones (Relación con Usuario)
// -----------------------------------------------------------------------------

// Asociación 1:1 (HasOne) entre Usuario y Estudiante.
// Significa que un Usuario puede tener un registro de Estudiante (pero no siempre).
// Esta asociación establece la FK en la tabla Estudiante (idUsuario).
Usuario.hasOne(Estudiante, {
    foreignKey: 'idUsuario', // El nombre de la FK en la tabla Estudiante
    onDelete: 'CASCADE', // Coincide con tu script SQL
    onUpdate: 'CASCADE', // Coincide con tu script SQL
});

// La relación inversa (Estudiante pertenece a Usuario) es necesaria para consultas JOIN
Estudiante.belongsTo(Usuario, {
    foreignKey: 'idUsuario',
});

export default Estudiante;