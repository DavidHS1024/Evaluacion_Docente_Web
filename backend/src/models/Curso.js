import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Curso = sequelize.define('Curso', {
    idCurso: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'idCurso'
    },
    codigoCurso: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        field: 'CodigoCurso'
    },
    nombreCurso: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'NombreCurso'
    },
    estadoCurso: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
        field: 'EstadoCurso'
    }
}, {
    tableName: 'Curso',
    timestamps: false
});

export default Curso;