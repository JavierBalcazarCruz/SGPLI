import jwt from "jsonwebtoken";
import conectarDB from "../config/db.js";

/**
 * Middleware para verificar autenticación mediante JWT
 * Protege rutas y proporciona datos del usuario
 */
const checkAuth = async (req, res, next) => {
    let connection;
    
    try {
        // 1. Extraer token del header de autorización
        const bearerToken = req.headers.authorization;
        
        // 2. Verificar formato Bearer token
        if (!bearerToken?.startsWith('Bearer ')) {
            return res.status(403).json({ msg: 'Formato de token inválido' });
        }

        // 3. Extraer token sin 'Bearer '
        const token = bearerToken.split(' ')[1];
        
        if (!token) {
            return res.status(403).json({ msg: 'Token no proporcionado' });
        }

        try {
            // 4. Verificar y decodificar token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // 5. Conexión a BD
            connection = await conectarDB();
            
            // 6. Buscar usuario y verificar que esté activo
            const [users] = await connection.execute(
                `SELECT id, nombre, email, tipo, activo 
                 FROM usuarios 
                 WHERE id = ? AND activo = 1`,
                [decoded.id]
            );

            if (!users.length) {
                return res.status(403).json({ msg: 'Usuario no encontrado o inactivo' });
            }

            // 7. Almacenar datos del usuario en el request
            req.usuario = users[0];
            next();

        } catch (jwtError) {
            console.log('Error JWT:', jwtError);
            return res.status(403).json({ msg: 'Token inválido o expirado' });
        }

    } catch (error) {
        console.log('Error en autenticación:', error);
        return res.status(500).json({ msg: 'Error del servidor' });
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (error) {
                console.log('Error al cerrar conexión:', error);
            }
        }
    }
};

/**
 * Middleware para verificar que el usuario sea administrador
 * Se usa después de checkAuth
 */
const soloAdmin = (req, res, next) => {
    if (req.usuario.tipo !== 'admin') {
        return res.status(403).json({ 
            msg: 'Solo administradores pueden realizar esta acción' 
        });
    }
    next();
};

/**
 * Middleware para verificar que el usuario sea admin o encargado
 * (opcional, ya que checkAuth ya verifica usuarios activos)
 */
const adminOEncargado = (req, res, next) => {
    const tiposPermitidos = ['admin', 'encargado'];
    if (!tiposPermitidos.includes(req.usuario.tipo)) {
        return res.status(403).json({ 
            msg: 'No tienes permisos para realizar esta acción' 
        });
    }
    next();
};

export { checkAuth, soloAdmin, adminOEncargado };