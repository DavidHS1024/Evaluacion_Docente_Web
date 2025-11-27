import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import Usuario from './Usuario.js'; 

const Docente = sequelize.define('Docente', {
    // idUsuario es la clave primaria de Docente y la clave foránea a Usuario
    idUsuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    // Código único del docente (DNI o código de empleado)
    codigoDocente: { // Cambiado a camelCase
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        field: 'codigo_docente' // Mapeo a snake_case en la BD
    },
    // Clasificación del docente (permite NULL)
    clasificacion: { // Cambiado a camelCase
        type: DataTypes.STRING(40),
        allowNull: true,
    },
}, {
    tableName: 'Docente',
    freezeTableName: true,
    timestamps: false,
});

// -----------------------------------------------------------------------------
// Definición de Asociaciones (Relación 1:1 con Usuario)
// -----------------------------------------------------------------------------

// Asociación 1:1 entre Usuario y Docente.
Usuario.hasOne(Docente, {
    foreignKey: 'idUsuario', 
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
});

// La relación inversa (Docente pertenece a Usuario)
Docente.belongsTo(Usuario, {
    foreignKey: 'idUsuario',
});

export default Docente;