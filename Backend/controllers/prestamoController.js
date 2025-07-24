import conectarDB from '../config/db.js';
import generarCodigoPrestamo from '../helpers/generarCodigo.js';

/**
 * 🆕 CREAR NUEVO PRÉSTAMO
 * Permite prestar múltiples items a un usuario
 */
const crearPrestamo = async (req, res) => {
    let connection;
    
    try {
        // 1. Extraer datos del request
        const {
            usuario_prestador_id,
            fecha_devolucion_estimada,
            items, // Array: [{item_id, cantidad, condicion_prestamo?}]
            observaciones
        } = req.body;

        // 2. Validaciones básicas
        if (!usuario_prestador_id || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ 
                msg: 'Usuario y lista de items son obligatorios' 
            });
        }

        // 3. Validar estructura de items
        for (const item of items) {
            if (!item.item_id || !item.cantidad || item.cantidad <= 0) {
                return res.status(400).json({ 
                    msg: 'Cada item debe tener ID y cantidad válida' 
                });
            }
        }

        // 4. Conexión y transacción
        connection = await conectarDB();
        await connection.beginTransaction();

        try {
            // 5. Verificar que el usuario prestador existe
            const [usuarioPrestador] = await connection.execute(
                'SELECT id, nombre FROM usuarios WHERE id = ? AND activo = 1',
                [usuario_prestador_id]
            );

            if (!usuarioPrestador.length) {
                throw new Error('Usuario prestador no encontrado o inactivo');
            }

            // 6. Verificar disponibilidad de todos los items
            const verificaciones = [];
            for (const item of items) {
                const [itemData] = await connection.execute(
                    `SELECT id, nombre, cantidad_disponible, estado 
                     FROM items WHERE id = ?`,
                    [item.item_id]
                );

                if (!itemData.length) {
                    throw new Error(`Item con ID ${item.item_id} no encontrado`);
                }

                const itemInfo = itemData[0];
                
                if (itemInfo.estado !== 'disponible') {
                    throw new Error(`${itemInfo.nombre} no está disponible para préstamo`);
                }

                if (itemInfo.cantidad_disponible < item.cantidad) {
                    throw new Error(
                        `${itemInfo.nombre}: solo hay ${itemInfo.cantidad_disponible} disponibles, ` +
                        `se solicitan ${item.cantidad}`
                    );
                }

                verificaciones.push({
                    ...item,
                    nombre: itemInfo.nombre,
                    disponible: itemInfo.cantidad_disponible
                });
            }

            // 7. Generar código único del préstamo
            let codigoUnico;
            let codigoExiste = true;
            let intentos = 0;

            while (codigoExiste && intentos < 5) {
                codigoUnico = generarCodigoPrestamo();
                const [codigoCheck] = await connection.execute(
                    'SELECT id FROM prestamos WHERE codigo = ?',
                    [codigoUnico]
                );
                codigoExiste = codigoCheck.length > 0;
                intentos++;
            }

            if (codigoExiste) {
                throw new Error('Error al generar código único del préstamo');
            }

            // 8. Crear el préstamo principal
            const [resultadoPrestamo] = await connection.execute(
                `INSERT INTO prestamos (
                    codigo, usuario_prestador_id, usuario_encargado_id,
                    fecha_prestamo, fecha_devolucion_estimada, estado, observaciones
                ) VALUES (?, ?, ?, NOW(), ?, 'activo', ?)`,
                [
                    codigoUnico,
                    usuario_prestador_id,
                    req.usuario.id, // El encargado que autoriza
                    fecha_devolucion_estimada || null,
                    observaciones || null
                ]
            );

            const prestamoId = resultadoPrestamo.insertId;

            // 9. Insertar items del préstamo
            const itemsCreados = [];
            for (const item of items) {
                const [resultadoItem] = await connection.execute(
                    `INSERT INTO prestamo_items (
                        prestamo_id, item_id, cantidad, 
                        condicion_prestamo, estado
                    ) VALUES (?, ?, ?, ?, 'pendiente')`,
                    [
                        prestamoId,
                        item.item_id,
                        item.cantidad,
                        item.condicion_prestamo || 'bueno'
                    ]
                );

                // Los triggers se encargan de actualizar el inventario automáticamente
                
                itemsCreados.push({
                    id: resultadoItem.insertId,
                    item_id: item.item_id,
                    cantidad: item.cantidad,
                    condicion_prestamo: item.condicion_prestamo || 'bueno'
                });
            }

            // 10. Commit de la transacción
            await connection.commit();

            // 11. Obtener el préstamo completo para la respuesta
            const prestamoCompleto = await obtenerPrestamoCompleto(connection, prestamoId);

            // 12. Respuesta exitosa
            res.status(201).json({
                msg: 'Préstamo creado exitosamente',
                prestamo: prestamoCompleto,
                voucher_codigo: codigoUnico
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        }

    } catch (error) {
        console.log('Error al crear préstamo:', error);
        res.status(400).json({ msg: error.message || 'Error del servidor' });
    } finally {
        if (connection) await connection.end();
    }
};

/**
 * 📋 OBTENER TODOS LOS PRÉSTAMOS
 * Con filtros opcionales y paginación
 */
const obtenerPrestamos = async (req, res) => {
    let connection;
    
try {
        const {
            estado,
            usuario_prestador_id, // NOTA: Esto espera un ID numérico, no un nombre
            fecha_desde,
            fecha_hasta
        } = req.query;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        connection = await conectarDB();

        let whereConditions = [];
        let params = [];

        if (estado) {
            whereConditions.push('p.estado = ?');
            params.push(estado);
        }

        if (usuario_prestador_id) {
            whereConditions.push('p.usuario_prestador_id = ?');
            params.push(parseInt(usuario_prestador_id));
        }

        if (fecha_desde) {
            whereConditions.push('DATE(p.fecha_prestamo) >= ?');
            params.push(fecha_desde);
        }

        if (fecha_hasta) {
            whereConditions.push('DATE(p.fecha_prestamo) <= ?');
            params.push(fecha_hasta);
        }

        const whereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

        const finalParamsMainQuery = [...params, limit, offset];

        // CAMBIA 'execute' a 'query' aquí:
        const [prestamos] = await connection.query(`
            SELECT
                p.*,
                up.nombre as usuario_prestador_nombre,
                up.email as usuario_prestador_email,
                ue.nombre as usuario_encargado_nombre,
                COUNT(pi.id) as total_items,
                COUNT(CASE WHEN pi.estado = 'pendiente' THEN 1 END) as items_pendientes,
                COUNT(CASE WHEN pi.estado = 'entregado' THEN 1 END) as items_devueltos
            FROM prestamos p
            INNER JOIN usuarios up ON p.usuario_prestador_id = up.id
            INNER JOIN usuarios ue ON p.usuario_encargado_id = ue.id
            LEFT JOIN prestamo_items pi ON p.id = pi.prestamo_id
            ${whereClause}
            GROUP BY p.id
            ORDER BY p.fecha_prestamo DESC
            LIMIT ? OFFSET ?
        `, finalParamsMainQuery);

        const finalParamsCountQuery = [...params];

        // CAMBIA 'execute' a 'query' aquí:
        const [totalResult] = await connection.query(`
            SELECT COUNT(DISTINCT p.id) as total
            FROM prestamos p
            INNER JOIN usuarios up ON p.usuario_prestador_id = up.id
            INNER JOIN usuarios ue ON p.usuario_encargado_id = ue.id
            ${whereClause}
        `, finalParamsCountQuery);

        const total = totalResult[0].total;

        res.json({
            prestamos,
            paginacion: {
                page: page,
                limit: limit,
                total,
                total_pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener préstamos:', error);
        res.status(500).json({ msg: 'Error del servidor al obtener préstamos', details: error.message });
    } finally {
        if (connection) await connection.end();
    }
};

/**
 * 🔍 OBTENER PRÉSTAMO POR CÓDIGO (VOUCHER)
 * Para devoluciones y consultas
 */
const obtenerPrestamoPorCodigo = async (req, res) => {
    let connection;
    
    try {
        const { codigo } = req.params;

        if (!codigo?.trim()) {
            return res.status(400).json({ msg: 'Código de préstamo requerido' });
        }

        connection = await conectarDB();
        const prestamoCompleto = await obtenerPrestamoCompleto(connection, null, codigo.trim());

        if (!prestamoCompleto) {
            return res.status(404).json({ msg: 'Préstamo no encontrado' });
        }

        res.json({ prestamo: prestamoCompleto });

    } catch (error) {
        console.log('Error al obtener préstamo por código:', error);
        res.status(500).json({ msg: 'Error del servidor' });
    } finally {
        if (connection) await connection.end();
    }
};

/**
 * ↩️ DEVOLVER ITEMS (PARCIAL O TOTAL)
 * Núcleo del sistema de devoluciones
 */
const devolverItems = async (req, res) => {
    let connection;
    
    try {
        // 1. Extraer datos
        const { codigo } = req.params;
        const { items_devueltos, observaciones } = req.body;
        // items_devueltos: [{prestamo_item_id, condicion_devolucion?}]

        // 2. Validaciones
        if (!codigo?.trim()) {
            return res.status(400).json({ msg: 'Código de préstamo requerido' });
        }

        if (!items_devueltos || !Array.isArray(items_devueltos) || items_devueltos.length === 0) {
            return res.status(400).json({ msg: 'Items a devolver son requeridos' });
        }

        // 3. Conexión y transacción
        connection = await conectarDB();
        await connection.beginTransaction();

        try {
            // 4. Verificar que el préstamo existe
            const [prestamos] = await connection.execute(
                'SELECT * FROM prestamos WHERE codigo = ?',
                [codigo.trim()]
            );

            if (!prestamos.length) {
                throw new Error('Préstamo no encontrado');
            }

            const prestamo = prestamos[0];

            if (prestamo.estado === 'completado') {
                throw new Error('Este préstamo ya fue completado');
            }

            // 5. Procesar cada item a devolver
            const itemsDevueltos = [];
            
            for (const itemDevuelto of items_devueltos) {
                const { prestamo_item_id, condicion_devolucion } = itemDevuelto;

                // Verificar que el item pertenece al préstamo y está pendiente
                const [prestamoItems] = await connection.execute(
                    `SELECT pi.*, i.nombre as item_nombre
                     FROM prestamo_items pi
                     INNER JOIN items i ON pi.item_id = i.id
                     WHERE pi.id = ? AND pi.prestamo_id = ? AND pi.estado = 'pendiente'`,
                    [prestamo_item_id, prestamo.id]
                );

                if (!prestamoItems.length) {
                    throw new Error(`Item no encontrado o ya fue devuelto`);
                }

                const prestamoItem = prestamoItems[0];

                // Actualizar el item como devuelto
                await connection.execute(
                    `UPDATE prestamo_items SET 
                        estado = 'entregado',
                        condicion_devolucion = ?,
                        fecha_devolucion = NOW()
                     WHERE id = ?`,
                    [condicion_devolucion || 'bueno', prestamo_item_id]
                );

                // Los triggers se encargan de actualizar el inventario

                itemsDevueltos.push({
                    prestamo_item_id,
                    item_nombre: prestamoItem.item_nombre,
                    cantidad: prestamoItem.cantidad,
                    condicion_devolucion: condicion_devolucion || 'bueno'
                });
            }

            // 6. Actualizar observaciones del préstamo si se proporcionaron
            if (observaciones?.trim()) {
                const observacionesActuales = prestamo.observaciones || '';
                const nuevasObservaciones = observacionesActuales + 
                    `\n[${new Date().toLocaleString()}] Devolución: ${observaciones.trim()}`;

                await connection.execute(
                    'UPDATE prestamos SET observaciones = ? WHERE id = ?',
                    [nuevasObservaciones, prestamo.id]
                );
            }

            // 7. El trigger se encarga de actualizar el estado del préstamo automáticamente

            // 8. Commit
            await connection.commit();

            // 9. Obtener préstamo actualizado
            const prestamoActualizado = await obtenerPrestamoCompleto(connection, prestamo.id);

            // 10. Respuesta exitosa
            res.json({
                msg: `${itemsDevueltos.length} item(s) devuelto(s) correctamente`,
                items_devueltos: itemsDevueltos,
                prestamo: prestamoActualizado
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        }

    } catch (error) {
        console.log('Error al devolver items:', error);
        res.status(400).json({ msg: error.message || 'Error del servidor' });
    } finally {
        if (connection) await connection.end();
    }
};

/**
 * 📊 OBTENER ESTADÍSTICAS DE PRÉSTAMOS
 */
const obtenerEstadisticasPrestamos = async (req, res) => {
    let connection;
    
    try {
        connection = await conectarDB();

        // 1. Estadísticas generales
        const [estadisticasGenerales] = await connection.execute(`
            SELECT 
                COUNT(*) as total_prestamos,
                COUNT(CASE WHEN estado = 'activo' THEN 1 END) as prestamos_activos,
                COUNT(CASE WHEN estado = 'parcial' THEN 1 END) as prestamos_parciales,
                COUNT(CASE WHEN estado = 'completado' THEN 1 END) as prestamos_completados,
                COUNT(CASE WHEN estado = 'vencido' THEN 1 END) as prestamos_vencidos
            FROM prestamos
        `);

        // 2. Items más prestados
        const [itemsMasPrestados] = await connection.execute(`
            SELECT 
                i.nombre,
                COUNT(pi.id) as veces_prestado,
                SUM(pi.cantidad) as total_cantidad_prestada
            FROM prestamo_items pi
            INNER JOIN items i ON pi.item_id = i.id
            GROUP BY i.id, i.nombre
            ORDER BY veces_prestado DESC
            LIMIT 5
        `);

        // 3. Usuarios que más prestan
        const [usuariosMasActivos] = await connection.execute(`
            SELECT 
                u.nombre,
                u.email,
                COUNT(p.id) as total_prestamos,
                COUNT(CASE WHEN p.estado = 'activo' THEN 1 END) as prestamos_pendientes
            FROM usuarios u
            INNER JOIN prestamos p ON u.id = p.usuario_prestador_id
            GROUP BY u.id, u.nombre, u.email
            ORDER BY total_prestamos DESC
            LIMIT 5
        `);

        // 4. Préstamos por mes (últimos 6 meses)
        const [prestamosPorMes] = await connection.execute(`
            SELECT 
                DATE_FORMAT(fecha_prestamo, '%Y-%m') as mes,
                COUNT(*) as total_prestamos
            FROM prestamos
            WHERE fecha_prestamo >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(fecha_prestamo, '%Y-%m')
            ORDER BY mes DESC
        `);

        res.json({
            estadisticas_generales: estadisticasGenerales[0],
            items_mas_prestados: itemsMasPrestados,
            usuarios_mas_activos: usuariosMasActivos,
            prestamos_por_mes: prestamosPorMes
        });

    } catch (error) {
        console.log('Error al obtener estadísticas de préstamos:', error);
        res.status(500).json({ msg: 'Error del servidor' });
    } finally {
        if (connection) await connection.end();
    }
};

/**
 * 🔧 FUNCIÓN AUXILIAR: Obtener préstamo completo con todos sus detalles
 */
const obtenerPrestamoCompleto = async (connection, prestamoId = null, codigo = null) => {
    const whereClause = prestamoId ? 'p.id = ?' : 'p.codigo = ?';
    const param = prestamoId || codigo;

    const [prestamos] = await connection.execute(`
        SELECT 
            p.*,
            up.nombre as usuario_prestador_nombre,
            up.email as usuario_prestador_email,
            ue.nombre as usuario_encargado_nombre
        FROM prestamos p
        INNER JOIN usuarios up ON p.usuario_prestador_id = up.id
        INNER JOIN usuarios ue ON p.usuario_encargado_id = ue.id
        WHERE ${whereClause}
    `, [param]);

    if (!prestamos.length) return null;

    const prestamo = prestamos[0];

    // Obtener items del préstamo
    const [items] = await connection.execute(`
        SELECT 
            pi.*,
            i.nombre as item_nombre,
            i.descripcion as item_descripcion,
            i.codigo_inventario
        FROM prestamo_items pi
        INNER JOIN items i ON pi.item_id = i.id
        WHERE pi.prestamo_id = ?
        ORDER BY pi.id ASC
    `, [prestamo.id]);

    return {
        ...prestamo,
        items
    };
};

export {
    crearPrestamo,
    obtenerPrestamos,
    obtenerPrestamoPorCodigo,
    devolverItems,
    obtenerEstadisticasPrestamos
};