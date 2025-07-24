import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import conectarDB from './config/db.js';

// Importar rutas
import authRoutes from './routes/authRoutes.js';
import itemRoutes from './routes/itemRoutes.js';

const app = express();
dotenv.config();

// Conectar DB
conectarDB();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
    res.json({ 
        msg: "🚀 API Sistema de Préstamos funcionando correctamente",
        version: "1.0.0",
        endpoints: {
            auth: "/api/auth",
            items: "/api/items"
        }
    });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📋 Endpoints disponibles:`);
    console.log(`   - Autenticación: http://localhost:${PORT}/api/auth`);
    console.log(`   - Items: http://localhost:${PORT}/api/items`);
});