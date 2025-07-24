import mysql from 'mysql2/promise';

const conectarDB = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
            ssl: {
                rejectUnauthorized: false
            }
        });

        await connection.connect();
        console.log(`MySQL conectado en: ${connection.config.host}`);
        
        return connection;
    } catch (error) {
        console.log(`Error de conexión: ${error.message}`);
        process.exit(1);
    }
}

export default conectarDB;