import express from "express";
const router = express.Router();

import {
    registrar,
    autenticar,
    perfil,
    cambiarPassword,
    listarUsuarios,
    toggleUsuario,
    actualizarUsuario  // ← AGREGAR IMPORT
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
 * Actualizar usuario (solo admin) ← NUEVA RUTA
 */
router.put('/usuarios/:id', checkAuth, soloAdmin, actualizarUsuario);

/**
 * PUT /api/auth/usuarios/:id/toggle
 * Activar/desactivar usuario (solo admin)
 */
router.put('/usuarios/:id/toggle', checkAuth, soloAdmin, toggleUsuario);

export default router;