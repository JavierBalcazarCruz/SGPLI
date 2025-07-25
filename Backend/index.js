import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import conectarDB from './config/db.js';

// Importar rutas
import authRoutes from './routes/authRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import prestamoRoutes from './routes/prestamoRoutes.js';

const app = express();
dotenv.config();

// Conectar DB
conectarDB();

// Configuración de CORS para el frontend
const corsOptions = {
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:3000', // React por defecto
        'http://127.0.0.1:5173', // Vite por defecto
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Logging para debug
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path} - Origin: ${req.get('origin')}`);
        next();
    });
}

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/prestamos', prestamoRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
    res.json({ 
        msg: "🚀 API Sistema de Préstamos funcionando correctamente",
        version: "1.0.0",
        frontend_url: process.env.FRONTEND_URL,
        endpoints: {
            auth: "/api/auth",
            items: "/api/items",
            prestamos: "/api/prestamos"
        }
    });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`🌐 Frontend permitido desde: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log(`📋 Endpoints disponibles:`);
    console.log(`   - Autenticación: http://localhost:${PORT}/api/auth`);
    console.log(`   - Items: http://localhost:${PORT}/api/items`);
    console.log(`   - Préstamos: http://localhost:${PORT}/api/prestamos`);
});