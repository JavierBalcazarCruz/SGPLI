import express from "express";
const router = express.Router();

// Controladores
import {
    crearPrestamo,
    obtenerPrestamos,
    obtenerPrestamoPorCodigo,
    devolverItems,
    obtenerEstadisticasPrestamos
} from '../controllers/prestamoController.js';

// Middleware de autenticación
import { checkAuth, soloAdmin } from '../middleware/authMiddleware.js';

// ====================================
// 🆕 RUTAS DE PRÉSTAMOS
// ====================================

/**
 * GET /api/prestamos
 * Obtener todos los préstamos con filtros
 * Query params: estado, usuario_prestador, fecha_desde, fecha_hasta, page, limit
 * Acceso: Admin y Encargado
 */
router.get('/', checkAuth, obtenerPrestamos);

/**
 * GET /api/prestamos/estadisticas
 * Obtener estadísticas de préstamos
 * Acceso: Admin y Encargado
 */
router.get('/estadisticas', checkAuth, obtenerEstadisticasPrestamos);

/**
 * GET /api/prestamos/voucher/:codigo
 * Obtener préstamo por código de voucher
 * Acceso: Admin y Encargado
 */
router.get('/voucher/:codigo', checkAuth, obtenerPrestamoPorCodigo);

/**
 * POST /api/prestamos
 * Crear nuevo préstamo
 * Body: {
 *   usuario_prestador_id: number,
 *   fecha_devolucion_estimada?: string,
 *   items: [{item_id: number, cantidad: number, condicion_prestamo?: string}],
 *   observaciones?: string
 * }
 * Acceso: Admin y Encargado
 */
router.post('/', checkAuth, crearPrestamo);

/**
 * PUT /api/prestamos/:codigo/devolver
 * Devolver items de un préstamo (parcial o total)
 * Body: {
 *   items_devueltos: [{prestamo_item_id: number, condicion_devolucion?: string}],
 *   observaciones?: string
 * }
 * Acceso: Admin y Encargado
 */
router.put('/:codigo/devolver', checkAuth, devolverItems);

export default router;