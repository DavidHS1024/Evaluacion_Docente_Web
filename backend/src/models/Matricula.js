import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Matricula = sequelize.define('Matricula', {
    idMatricula: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'idMatricula'
    },
    estudianteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'Estudiante_idUsuario'
    },
    fechaMatricula: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'FechaMatricula'
    },
    periodo: {
        type: DataTypes.STRING(10),
        allowNull: false,
        field: 'Periodo'
    }
}, {
    tableName: 'Matricula',
    timestamps: false
});

export default Matricula;