import { Sequelize } from 'sequelize';
import 'dotenv/config'; // ¡Importante! Carga las variables del .env en process.env

// Extrae las variables del entorno (process.env)
const { DB_DIALECT, DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

// Inicializa Sequelize con la configuración de MySQL
export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    dialect: DB_DIALECT,
    // Configuraciones de pool (optimización de conexiones)
    pool: {
        max: 5,
        min: 0, 
        acquire: 30000, 
        idle: 10000 
    },
    // Opciones para el manejo correcto de caracteres
    dialectOptions: {
        charset: 'utf8mb4',
    },
    // Si quieres ver las consultas SQL en consola, cambia a true
    logging: false, 
});

/**
 * Función asíncrona para probar la conexión a la base de datos.
 */
export async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos MySQL establecida correctamente.');
    } catch (error) {
        console.error('❌ Error al conectar a la base de datos:', error.message);
        throw new Error(`Falló la conexión a la BD. Revisa tus variables en el archivo .env: ${error.message}`);
    }
}