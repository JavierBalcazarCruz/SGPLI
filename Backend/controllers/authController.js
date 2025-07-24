import conectarDB from '../config/db.js';
import generarJWT from '../helpers/generarJWT.js';
import bcrypt from 'bcrypt';

/**
 * Registrar nuevo usuario (solo admin puede crear usuarios)
 */
const registrar = async (req, res) => {
    let connection;
    
    try {
        // 1. Extraer y limpiar datos
        const { 
            nombre = '', 
            email = '', 
            password,
            tipo = 'encargado'
        } = req.body;

        // 2. Limpieza de datos
        const emailLimpio = email.trim().toLowerCase();
        const nombreLimpio = nombre.trim();

        // 3. Validaciones básicas
        if (!emailLimpio || !nombreLimpio || !password) {
            return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
        }

        // Validar longitud mínima del password
        if (password.length < 6) {
            return res.status(400).json({ 
                msg: 'El password debe tener al menos 6 caracteres' 
            });
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailLimpio)) {
            return res.status(400).json({ msg: 'Email no válido' });
        }

        // Validar tipo de usuario
        const tiposPermitidos = ['admin', 'encargado'];
        if (!tiposPermitidos.includes(tipo)) {
            return res.status(400).json({ msg: 'Tipo de usuario no válido' });
        }

        // 4. Hash del password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 5. Conexión a la base de datos
        connection = await conectarDB();

        // 6. Verificar email duplicado
        const [existingUsers] = await connection.execute(
            'SELECT id FROM usuarios WHERE email = ?',
            [emailLimpio]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ msg: 'El email ya está registrado' });
        }

        // 7. Insertar usuario
        const [resultado] = await connection.execute(
            `INSERT INTO usuarios (nombre, email, password, tipo, activo) 
             VALUES (?, ?, ?, ?, 1)`,
            [nombreLimpio, emailLimpio, passwordHash, tipo]
        );

        // 8. Respuesta exitosa
        res.status(201).json({
            msg: 'Usuario registrado correctamente',
            usuario: {
                id: resultado.insertId,
                nombre: nombreLimpio,
                email: emailLimpio,
                tipo
            }
        });

    } catch (error) {
        console.log('Error en registro:', error.message);
        res.status(500).json({ msg: 'Error interno del servidor' });
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (error) {
                console.log('Error al cerrar la conexión:', error.message);
            }
        }
    }
};

/**
 * Autenticar usuario - Login
 */
const autenticar = async (req, res) => {
    let connection;
    
    try {
        // 1. Extraer datos del request
        const { email, password } = req.body;

        // 2. Validación básica de campos
        if (!email || !password) {
            return res.status(400).json({ msg: 'Email y password son obligatorios' });
        }

        // 3. Limpiar email
        const emailLimpio = email.trim().toLowerCase();

        // 4. Conexión a DB
        connection = await conectarDB();

        // 5. Buscar usuario activo
        const [users] = await connection.execute(
            `SELECT id, nombre, email, password, tipo, activo 
             FROM usuarios 
             WHERE email = ? AND activo = 1`,
            [emailLimpio]
        );

        const usuario = users[0];

        // 6. Validar existencia del usuario
        if (!usuario) {
            return res.status(400).json({ msg: 'Credenciales incorrectas' });
        }

        // 7. Verificar password
        const passwordCorrecto = await bcrypt.compare(password, usuario.password);

        if (!passwordCorrecto) {
            return res.status(400).json({ msg: 'Credenciales incorrectas' });
        }

        // 8. Generar JWT
        const token = generarJWT(usuario.id);

        // 9. Respuesta exitosa (sin enviar password)
        res.json({
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            tipo: usuario.tipo,
            token
        });

    } catch (error) {
        console.log('Error en autenticación:', error);
        res.status(500).json({ msg: 'Error del servidor' });
    } finally {
        if (connection) await connection.end();
    }
};

/**
 * Obtener perfil del usuario autenticado
 */
const perfil = async (req, res) => {
    try {
        // req.usuario ya viene del middleware de autenticación
        const { id, nombre, email, tipo } = req.usuario;
        
        res.json({
            id,
            nombre,
            email,
            tipo
        });
        
    } catch (error) {
        console.log('Error al obtener perfil:', error);
        res.status(500).json({ msg: 'Error al obtener perfil' });
    }
};

/**
 * Cambiar password del usuario autenticado
 */
const cambiarPassword = async (req, res) => {
    let connection;
    
    try {
        // 1. Extraer datos
        const { passwordActual, passwordNuevo } = req.body;
        const userId = req.usuario.id;

        // 2. Validaciones
        if (!passwordActual || !passwordNuevo) {
            return res.status(400).json({ msg: 'Ambos passwords son requeridos' });
        }

        if (passwordNuevo.length < 6) {
            return res.status(400).json({ 
                msg: 'El nuevo password debe tener al menos 6 caracteres' 
            });
        }

        // 3. Conexión a DB
        connection = await conectarDB();

        // 4. Obtener password actual del usuario
        const [users] = await connection.execute(
            'SELECT password FROM usuarios WHERE id = ? AND activo = 1',
            [userId]
        );

        if (!users.length) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        // 5. Verificar password actual
        const passwordValido = await bcrypt.compare(passwordActual, users[0].password);
        
        if (!passwordValido) {
            return res.status(400).json({ msg: 'Password actual incorrecto' });
        }

        // 6. Hash del nuevo password
        const salt = await bcrypt.genSalt(10);
        const nuevoPasswordHash = await bcrypt.hash(passwordNuevo, salt);

        // 7. Actualizar password en DB
        await connection.execute(
            'UPDATE usuarios SET password = ? WHERE id = ?',
            [nuevoPasswordHash, userId]
        );

        // 8. Respuesta exitosa
        res.json({ msg: 'Password actualizado correctamente' });

    } catch (error) {
        console.log('Error al cambiar password:', error);
        res.status(500).json({ msg: 'Error del servidor' });
    } finally {
        if (connection) await connection.end();
    }
};

/**
 * Listar todos los usuarios (solo admin)
 */
const listarUsuarios = async (req, res) => {
    let connection;
    
    try {
        // 1. Verificar que sea admin (esto se puede hacer también con middleware)
        if (req.usuario.tipo !== 'admin') {
            return res.status(403).json({ msg: 'Solo administradores pueden ver esta información' });
        }

        // 2. Conexión a DB
        connection = await conectarDB();

        // 3. Obtener usuarios (sin passwords)
        const [usuarios] = await connection.execute(
            `SELECT id, nombre, email, tipo, activo, fecha_creacion 
             FROM usuarios 
             ORDER BY fecha_creacion DESC`
        );

        // 4. Respuesta
        res.json(usuarios);

    } catch (error) {
        console.log('Error al listar usuarios:', error);
        res.status(500).json({ msg: 'Error del servidor' });
    } finally {
        if (connection) await connection.end();
    }
};

/**
 * Activar/Desactivar usuario (solo admin)
 */
const toggleUsuario = async (req, res) => {
    let connection;
    
    try {
        // 1. Verificar que sea admin
        if (req.usuario.tipo !== 'admin') {
            return res.status(403).json({ msg: 'Solo administradores pueden realizar esta acción' });
        }

        // 2. Extraer ID del usuario a modificar
        const { id } = req.params;
        const userId = parseInt(id);

        if (isNaN(userId) || userId <= 0) {
            return res.status(400).json({ msg: 'ID de usuario no válido' });
        }

        // 3. No permitir que se desactive a sí mismo
        if (userId === req.usuario.id) {
            return res.status(400).json({ msg: 'No puedes desactivar tu propia cuenta' });
        }

        // 4. Conexión a DB
        connection = await conectarDB();

        // 5. Verificar que el usuario existe
        const [usuarios] = await connection.execute(
            'SELECT id, activo FROM usuarios WHERE id = ?',
            [userId]
        );

        if (!usuarios.length) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        // 6. Cambiar estado
        const nuevoEstado = usuarios[0].activo ? 0 : 1;
        
        await connection.execute(
            'UPDATE usuarios SET activo = ? WHERE id = ?',
            [nuevoEstado, userId]
        );

        // 7. Respuesta
        res.json({ 
            msg: `Usuario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`,
            activo: nuevoEstado
        });

    } catch (error) {
        console.log('Error al cambiar estado del usuario:', error);
        res.status(500).json({ msg: 'Error del servidor' });
    } finally {
        if (connection) await connection.end();
    }
};



export {
    registrar,
    autenticar,
    perfil,
    cambiarPassword,
    listarUsuarios,
    toggleUsuario
};