import express from "express";
const router = express.Router();

import {
    registrar,
    autenticar,
    perfil,
    cambiarPassword,
    listarUsuarios,
    toggleUsuario,
    actualizarUsuario,
    obtenerMiHistorial,
    obtenerMisEstadisticas,
    actualizarMiPerfil
} from '../controllers/authController.js';

import { checkAuth, soloAdmin } from '../middleware/authMiddleware.js';

// ====================================
// RUTAS PÚBLICAS (sin autenticación)
// ====================================

/**
 * POST /api/auth/login
 * Autenticar usuario (login)
 */
router.post("/login", autenticar);

// 🚨 RUTA TEMPORAL - Solo para crear el primer admin
router.post("/registro-inicial", registrar);

// ====================================
// RUTAS PRIVADAS (requieren autenticación)
// ====================================

/**
 * GET /api/auth/perfil
 * Obtener perfil del usuario autenticado
 */
router.get('/perfil', checkAuth, perfil);

/**
 * PUT /api/auth/cambiar-password
 * Cambiar password del usuario autenticado
 */
router.put('/cambiar-password', checkAuth, cambiarPassword);

/**
 * GET /api/auth/mi-historial
 * Obtener historial personal del usuario autenticado
 */
router.get('/mi-historial', checkAuth, obtenerMiHistorial);

/**
 * GET /api/auth/mis-estadisticas
 * Obtener estadísticas personales del usuario autenticado
 */
router.get('/mis-estadisticas', checkAuth, obtenerMisEstadisticas);

/**
 * PUT /api/auth/mi-perfil
 * Actualizar perfil personal del usuario autenticado
 */
router.put('/mi-perfil', checkAuth, actualizarMiPerfil);

// ====================================
// RUTAS SOLO PARA ADMINISTRADORES
// ====================================

/**
 * POST /api/auth/registro
 * Registrar nuevo usuario (solo admin)
 */
router.post("/registro", checkAuth, soloAdmin, registrar);

/**
 * GET /api/auth/usuarios
 * Listar todos los usuarios (solo admin)
 */
router.get('/usuarios', checkAuth, soloAdmin, listarUsuarios);

/**
 * PUT /api/auth/usuarios/:id
 * Actualizar usuario (solo admin)
 */
router.put('/usuarios/:id', checkAuth, soloAdmin, actualizarUsuario);

/**
 * PUT /api/auth/usuarios/:id/toggle
 * Activar/desactivar usuario (solo admin)
 */
router.put('/usuarios/:id/toggle', checkAuth, soloAdmin, toggleUsuario);

export default router;