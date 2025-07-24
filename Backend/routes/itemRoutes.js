import express from "express";
const router = express.Router();

// Controladores
import {
    crearItem,
    obtenerItems,
    obtenerItem,
    actualizarItem,
    eliminarItem,
    obtenerEstadisticas
} from '../controllers/itemController.js';

import {
    obtenerCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
} from '../controllers/categoriaController.js';

// Middleware
import { checkAuth, soloAdmin } from '../middleware/authMiddleware.js';

// ====================================
// RUTAS DE ITEMS
// ====================================

/**
 * GET /api/items
 * Obtener todos los items (con filtros opcionales)
 * Query params: categoria, estado, disponibles_solo
 */
router.get('/', checkAuth, obtenerItems);

/**
 * GET /api/items/estadisticas
 * Obtener estadísticas del inventario
 */
router.get('/estadisticas', checkAuth, obtenerEstadisticas);

/**
 * GET /api/items/:id
 * Obtener item específico por ID
 */
router.get('/:id', checkAuth, obtenerItem);

/**
 * POST /api/items
 * Crear nuevo item (solo admin)
 */
router.post('/', checkAuth, soloAdmin, crearItem);

/**
 * PUT /api/items/:id
 * Actualizar item existente (solo admin)
 */
router.put('/:id', checkAuth, soloAdmin, actualizarItem);

/**
 * DELETE /api/items/:id
 * Eliminar item (dar de baja) - Solo admin
 */
router.delete('/:id', checkAuth, soloAdmin, eliminarItem);

// ====================================
// RUTAS DE CATEGORÍAS
// ====================================

/**
 * GET /api/items/categorias/todas
 * Obtener todas las categorías
 */
router.get('/categorias/todas', checkAuth, obtenerCategorias);

/**
 * POST /api/items/categorias
 * Crear nueva categoría (solo admin)
 */
router.post('/categorias', checkAuth, soloAdmin, crearCategoria);

/**
 * PUT /api/items/categorias/:id
 * Actualizar categoría (solo admin)
 */
router.put('/categorias/:id', checkAuth, soloAdmin, actualizarCategoria);

/**
 * DELETE /api/items/categorias/:id
 * Eliminar categoría (solo admin)
 */
router.delete('/categorias/:id', checkAuth, soloAdmin, eliminarCategoria);

export default router;