import conectarDB from '../config/db.js';

/**
 * Crear nuevo item en el inventario (solo admin)
 */
const crearItem = async (req, res) => {
    let connection;
    
    try {
        // 1. Extraer y validar datos
        const {
            nombre,
            descripcion,
            cantidad_total,
            categoria_id,
            codigo_inventario
        } = req.body;

        // 2. Validaciones básicas
        if (!nombre?.trim()) {
            return res.status(400).json({ msg: 'El nombre del item es obligatorio' });
        }

        if (!cantidad_total || cantidad_total < 0) {
            return res.status(400).json({ msg: 'La cantidad total debe ser mayor o igual a 0' });
        }

        // 3. Limpiar datos
        const nombreLimpio = nombre.trim();
        const descripcionLimpia = descripcion?.trim() || null;
        const codigoLimpio = codigo_inventario?.trim() || null;
        const cantidadTotal = parseInt(cantidad_total);

        // 4. Conexión a BD
        connection = await conectarDB();

        // 5. Verificar que la categoría existe (si se proporcionó)
        if (categoria_id) {
            const [categorias] = await connection.execute(
                'SELECT id FROM categorias WHERE id = ?',
                [categoria_id]
            );

            if (categorias.length === 0) {
                return res.status(400).json({ msg: 'La categoría seleccionada no existe' });
            }
        }

        // 6. Verificar código único (si se proporcionó)
        if (codigoLimpio) {
            const [codigosExistentes] = await connection.execute(
                'SELECT id FROM items WHERE codigo_inventario = ?',
                [codigoLimpio]
            );

            if (codigosExistentes.length > 0) {
                return res.status(400).json({ msg: 'El código de inventario ya existe' });
            }
        }

        // 7. Insertar item
        const [resultado] = await connection.execute(
            `INSERT INTO items (
                nombre, descripcion, cantidad_total, cantidad_disponible, 
                categoria_id, codigo_inventario, estado
            ) VALUES (?, ?, ?, ?, ?, ?, 'disponible')`,
            [
                nombreLimpio,
                descripcionLimpia,
                cantidadTotal,
                cantidadTotal, // Inicialmente todo está disponible
                categoria_id || null,
                codigoLimpio
            ]
        );

        // 8. Registrar en historial
        await connection.execute(
            `INSERT INTO historial_movimientos (
                tipo, usuario_id, item_id, cantidad, observaciones
            ) VALUES ('ajuste', ?, ?, ?, 'Item creado')`,
            [req.usuario.id, resultado.insertId, cantidadTotal]
        );

        // 9. Obtener el item creado con su categoría
        const [itemCreado] = await connection.execute(
            `SELECT i.*, c.nombre as categoria_nombre 
             FROM items i
             LEFT JOIN categorias c ON i.categoria_id = c.id
             WHERE i.id = ?`,
            [resultado.insertId]
        );

        // 10. Respuesta exitosa
        res.status(201).json({
            msg: 'Item creado correctamente',
            item: itemCreado[0]
        });

    } catch (error) {
        console.log('Error al crear item:', error);
        res.status(500).json({ msg: 'Error del servidor' });
    } finally {
        if (connection) await connection.end();
    }
};

/**
 * Obtener todos los items del inventario
 */
const obtenerItems = async (req, res) => {
    let connection;
    
    try {
        // 1. Parámetros de filtrado (opcional)
        const { categoria, estado, disponibles_solo } = req.query;

        // 2. Conexión a BD
        connection = await conectarDB();

        // 3. Construir query dinámicamente
        let query = `
            SELECT i.*, c.nombre as categoria_nombre 
            FROM items i
            LEFT JOIN categorias c ON i.categoria_id = c.id
            WHERE 1=1
        `;
        let params = [];

        // Filtrar por categoría
        if (categoria) {
            query += ` AND i.categoria_id = ?`;
            params.push(categoria);
        }

        // Filtrar por estado
        if (estado) {
            query += ` AND i.estado = ?`;
            params.push(estado);
        }

        // Solo items con disponibilidad
        if (disponibles_solo === 'true') {
            query += ` AND i.cantidad_disponible > 0`;
        }

        query += ` ORDER BY i.nombre ASC`;

        // 4. Ejecutar query
        const [items] = await connection.execute(query, params);

        // 5. Respuesta
        res.json({
            total: items.length,
            items
        });

    } catch (error) {
        console.log('Error al obtener items:', error);
        res.status(500).json({ msg: 'Error del servidor' });
    } finally {
        if (connection) await connection.end();
    }
};

/**
 * Obtener un item específico por ID
 */
const obtenerItem = async (req, res) => {
    let connection;
    
    try {
        // 1. Validar ID
        const { id } = req.params;
        const itemId = parseInt(id);

        if (isNaN(itemId) || itemId <= 0) {
            return res.status(400).json({ msg: 'ID de item no válido' });
        }

        // 2. Conexión a BD
        connection = await conectarDB();

        // 3. Obtener item con su categoría
        const [items] = await connection.execute(
            `SELECT i.*, c.nombre as categoria_nombre 
             FROM items i
             LEFT JOIN categorias c ON i.categoria_id = c.id
             WHERE i.id = ?`,
            [itemId]
        );

        if (items.length === 0) {
            return res.status(404).json({ msg: 'Item no encontrado' });
        }

        // 4. Obtener historial de movimientos del item
        const [movimientos] = await connection.execute(
            `SELECT hm.*, u.nombre as usuario_nombre
             FROM historial_movimientos hm
             INNER JOIN usuarios u ON hm.usuario_id = u.id
             WHERE hm.item_id = ?
             ORDER BY hm.fecha DESC
             LIMIT 10`,
            [itemId]
        );

        // 5. Respuesta
        res.json({
            item: items[0],
            historial_reciente: movimientos
        });

    } catch (error) {
        console.log('Error al obtener item:', error);
        res.status(500).json({ msg: 'Error del servidor' });
    } finally {
        if (connection) await connection.end();
    }
};

/**
 * Actualizar item existente (solo admin)
 */
const actualizarItem = async (req, res) => {
    let connection;
    
    try {
        // 1. Validar ID
        const { id } = req.params;
        const itemId = parseInt(id);

        if (isNaN(itemId) || itemId <= 0) {
            return res.status(400).json({ msg: 'ID de item no válido' });
        }

        // 2. Extraer datos
        const {
            nombre,
            descripcion,
            cantidad_total,
            categoria_id,
            codigo_inventario,
            estado
        } = req.body;

        // 3. Conexión a BD
        connection = await conectarDB();

        // 4. Verificar que el item existe
        const [itemsExistentes] = await connection.execute(
            'SELECT * FROM items WHERE id = ?',
            [itemId]
        );

        if (itemsExistentes.length === 0) {
            return res.status(404).json({ msg: 'Item no encontrado' });
        }

        const itemActual = itemsExistentes[0];

        // 5. Verificar código único (si cambió)
        if (codigo_inventario && codigo_inventario !== itemActual.codigo_inventario) {
            const [codigosExistentes] = await connection.execute(
                'SELECT id FROM items WHERE codigo_inventario = ? AND id != ?',
                [codigo_inventario.trim(), itemId]
            );

            if (codigosExistentes.length > 0) {
                return res.status(400).json({ msg: 'El código de inventario ya existe' });
            }
        }

        // 6. Verificar categoría (si cambió)
        if (categoria_id && categoria_id !== itemActual.categoria_id) {
            const [categorias] = await connection.execute(
                'SELECT id FROM categorias WHERE id = ?',
                [categoria_id]
            );

            if (categorias.length === 0) {
                return res.status(400).json({ msg: 'La categoría seleccionada no existe' });
            }
        }

        // 7. Iniciar transacción para cambios de cantidad
        await connection.beginTransaction();

        try {
            // 8. Actualizar datos básicos
            await connection.execute(
                `UPDATE items SET 
                    nombre = ?, descripcion = ?, categoria_id = ?, 
                    codigo_inventario = ?, estado = ?
                 WHERE id = ?`,
                [
                    nombre?.trim() || itemActual.nombre,
                    descripcion?.trim() || itemActual.descripcion,
                    categoria_id || itemActual.categoria_id,
                    codigo_inventario?.trim() || itemActual.codigo_inventario,
                    estado || itemActual.estado,
                    itemId
                ]
            );

            // 9. Manejar cambio de cantidad total (si cambió)
            if (cantidad_total && parseInt(cantidad_total) !== itemActual.cantidad_total) {
                const nuevaCantidadTotal = parseInt(cantidad_total);
                const diferencia = nuevaCantidadTotal - itemActual.cantidad_total;
                const nuevaCantidadDisponible = itemActual.cantidad_disponible + diferencia;

                // Validar que no quede cantidad disponible negativa
                if (nuevaCantidadDisponible < 0) {
                    throw new Error('No se puede reducir la cantidad total por debajo de la cantidad prestada');
                }

                // Actualizar cantidades
                await connection.execute(
                    `UPDATE items SET 
                        cantidad_total = ?, cantidad_disponible = ?
                     WHERE id = ?`,
                    [nuevaCantidadTotal, nuevaCantidadDisponible, itemId]
                );

                // Registrar movimiento
                await connection.execute(
                    `INSERT INTO historial_movimientos (
                        tipo, usuario_id, item_id, cantidad, observaciones
                    ) VALUES ('ajuste', ?, ?, ?, ?)`,
                    [
                        req.usuario.id, 
                        itemId, 
                        Math.abs(diferencia), 
                        `Ajuste de inventario: ${diferencia > 0 ? 'Incremento' : 'Reducción'} de ${Math.abs(diferencia)} unidades`
                    ]
                );
            }

            // 10. Commit
            await connection.commit();

            // 11. Obtener item actualizado
            const [itemActualizado] = await connection.execute(
                `SELECT i.*, c.nombre as categoria_nombre 
                 FROM items i
                 LEFT JOIN categorias c ON i.categoria_id = c.id
                 WHERE i.id = ?`,
                [itemId]
            );

            // 12. Respuesta exitosa
            res.json({
                msg: 'Item actualizado correctamente',
                item: itemActualizado[0]
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        }

    } catch (error) {
        console.log('Error al actualizar item:', error);
        res.status(error.message.includes('cantidad total') ? 400 : 500)
           .json({ msg: error.message || 'Error del servidor' });
    } finally {
        if (connection) await connection.end();
    }
};

/**
 * Eliminar item (cambiar estado a "dado_de_baja") - Solo admin
 */
const eliminarItem = async (req, res) => {
    let connection;
    
    try {
        // 1. Validar ID
        const { id } = req.params;
        const itemId = parseInt(id);

        if (isNaN(itemId) || itemId <= 0) {
            return res.status(400).json({ msg: 'ID de item no válido' });
        }

        // 2. Conexión a BD
        connection = await conectarDB();

        // 3. Verificar que el item existe
        const [items] = await connection.execute(
            'SELECT * FROM items WHERE id = ?',
            [itemId]
        );

        if (items.length === 0) {
            return res.status(404).json({ msg: 'Item no encontrado' });
        }

        const item = items[0];

        // 4. Verificar que no tiene préstamos activos
        const [prestamosActivos] = await connection.execute(
            `SELECT COUNT(*) as total 
             FROM prestamo_items pi
             INNER JOIN prestamos p ON pi.prestamo_id = p.id
             WHERE pi.item_id = ? AND pi.estado = 'pendiente'`,
            [itemId]
        );

        if (prestamosActivos[0].total > 0) {
            return res.status(400).json({ 
                msg: 'No se puede eliminar el item porque tiene préstamos activos' 
            });
        }

        // 5. Cambiar estado a dado_de_baja
        await connection.execute(
            `UPDATE items SET 
                estado = 'dado_de_baja', 
                cantidad_disponible = 0
             WHERE id = ?`,
            [itemId]
        );

        // 6. Registrar en historial
        await connection.execute(
            `INSERT INTO historial_movimientos (
                tipo, usuario_id, item_id, cantidad, observaciones
            ) VALUES ('ajuste', ?, ?, ?, 'Item dado de baja')`,
            [req.usuario.id, itemId, 0]
        );

        // 7. Respuesta exitosa
        res.json({ msg: 'Item dado de baja correctamente' });

    } catch (error) {
        console.log('Error al eliminar item:', error);
        res.status(500).json({ msg: 'Error del servidor' });
    } finally {
        if (connection) await connection.end();
    }
};

/**
 * Obtener estadísticas del inventario
 */
const obtenerEstadisticas = async (req, res) => {
    let connection;
    
    try {
        connection = await conectarDB();

        // 1. Estadísticas generales
        const [estadisticas] = await connection.execute(`
            SELECT 
                COUNT(*) as total_items,
                SUM(cantidad_total) as total_unidades,
                SUM(cantidad_disponible) as unidades_disponibles,
                SUM(cantidad_total - cantidad_disponible) as unidades_prestadas,
                COUNT(CASE WHEN estado = 'disponible' THEN 1 END) as items_disponibles,
                COUNT(CASE WHEN estado = 'mantenimiento' THEN 1 END) as items_mantenimiento,
                COUNT(CASE WHEN estado = 'dado_de_baja' THEN 1 END) as items_dados_baja
            FROM items
        `);

        // 2. Items con bajo stock (menos del 20% disponible)
        const [bajoStock] = await connection.execute(`
            SELECT i.*, c.nombre as categoria_nombre,
                   ROUND((cantidad_disponible / cantidad_total) * 100, 1) as porcentaje_disponible
            FROM items i
            LEFT JOIN categorias c ON i.categoria_id = c.id
            WHERE i.cantidad_total > 0 
              AND (i.cantidad_disponible / i.cantidad_total) < 0.2
              AND i.estado = 'disponible'
            ORDER BY porcentaje_disponible ASC
        `);

        // 3. Items más prestados
        const [masPrestados] = await connection.execute(`
            SELECT i.nombre, i.id,
                   COUNT(pi.id) as veces_prestado,
                   SUM(pi.cantidad) as total_unidades_prestadas
            FROM items i
            INNER JOIN prestamo_items pi ON i.id = pi.item_id
            GROUP BY i.id, i.nombre
            ORDER BY veces_prestado DESC
            LIMIT 5
        `);

        // 4. Respuesta
        res.json({
            estadisticas_generales: estadisticas[0],
            items_bajo_stock: bajoStock,
            items_mas_prestados: masPrestados
        });

    } catch (error) {
        console.log('Error al obtener estadísticas:', error);
        res.status(500).json({ msg: 'Error del servidor' });
    } finally {
        if (connection) await connection.end();
    }
};

export {
    crearItem,
    obtenerItems,
    obtenerItem,
    actualizarItem,
    eliminarItem,
    obtenerEstadisticas
};