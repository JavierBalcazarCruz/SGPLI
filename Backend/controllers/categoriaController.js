import conectarDB from '../config/db.js';

/**
 * Obtener todas las categorías
 */
const obtenerCategorias = async (req, res) => {
    let connection;
    
    try {
        connection = await conectarDB();

        // Obtener categorías con conteo de items
        const [categorias] = await connection.execute(`
            SELECT c.*, 
                   COUNT(i.id) as total_items,
                   SUM(i.cantidad_total) as total_unidades
            FROM categorias c
            LEFT JOIN items i ON c.id = i.categoria_id AND i.estado != 'dado_de_baja'
            GROUP BY c.id, c.nombre, c.descripcion
            ORDER BY c.nombre ASC
        `);

        res.json(categorias);

    } catch (error) {
        console.log('Error al obtener categorías:', error);
        res.status(500).json({ msg: 'Error del servidor' });
    } finally {
        if (connection) await connection.end();
    }
};

/**
 * Crear nueva categoría (solo admin)
 */
const crearCategoria = async (req, res) => {
    let connection;
    
    try {
        // 1. Validar datos
        const { nombre, descripcion } = req.body;

        if (!nombre?.trim()) {
            return res.status(400).json({ msg: 'El nombre de la categoría es obligatorio' });
        }

        const nombreLimpio = nombre.trim();
        const descripcionLimpia = descripcion?.trim() || null;

        // 2. Conexión a BD
        connection = await conectarDB();

        // 3. Verificar nombre único
        const [categoriasExistentes] = await connection.execute(
            'SELECT id FROM categorias WHERE LOWER(nombre) = LOWER(?)',
            [nombreLimpio]
        );

        if (categoriasExistentes.length > 0) {
            return res.status(400).json({ msg: 'Ya existe una categoría con ese nombre' });
        }

        // 4. Insertar categoría
        const [resultado] = await connection.execute(
            'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
            [nombreLimpio, descripcionLimpia]
        );

        // 5. Respuesta exitosa
        res.status(201).json({
            msg: 'Categoría creada correctamente',
            categoria: {
                id: resultado.insertId,
                nombre: nombreLimpio,
                descripcion: descripcionLimpia
            }
        });

    } catch (error) {
        console.log('Error al crear categoría:', error);
        res.status(500).json({ msg: 'Error del servidor' });
    } finally {
        if (connection) await connection.end();
    }
};

/**
 * Actualizar categoría (solo admin)
 */
const actualizarCategoria = async (req, res) => {
    let connection;
    
    try {
        // 1. Validar ID
        const { id } = req.params;
        const categoriaId = parseInt(id);

        if (isNaN(categoriaId) || categoriaId <= 0) {
            return res.status(400).json({ msg: 'ID de categoría no válido' });
        }

        // 2. Validar datos
        const { nombre, descripcion } = req.body;

        if (!nombre?.trim()) {
            return res.status(400).json({ msg: 'El nombre de la categoría es obligatorio' });
        }

        const nombreLimpio = nombre.trim();
        const descripcionLimpia = descripcion?.trim() || null;

        // 3. Conexión a BD
        connection = await conectarDB();

        // 4. Verificar que la categoría existe
        const [categoriasExistentes] = await connection.execute(
            'SELECT id FROM categorias WHERE id = ?',
            [categoriaId]
        );

        if (categoriasExistentes.length === 0) {
            return res.status(404).json({ msg: 'Categoría no encontrada' });
        }

        // 5. Verificar nombre único (excepto la misma categoría)
        const [nombresExistentes] = await connection.execute(
            'SELECT id FROM categorias WHERE LOWER(nombre) = LOWER(?) AND id != ?',
            [nombreLimpio, categoriaId]
        );

        if (nombresExistentes.length > 0) {
            return res.status(400).json({ msg: 'Ya existe una categoría con ese nombre' });
        }

        // 6. Actualizar categoría
        await connection.execute(
            'UPDATE categorias SET nombre = ?, descripcion = ? WHERE id = ?',
            [nombreLimpio, descripcionLimpia, categoriaId]
        );

        // 7. Respuesta exitosa
        res.json({
            msg: 'Categoría actualizada correctamente',
            categoria: {
                id: categoriaId,
                nombre: nombreLimpio,
                descripcion: descripcionLimpia
            }
        });

    } catch (error) {
        console.log('Error al actualizar categoría:', error);
        res.status(500).json({ msg: 'Error del servidor' });
    } finally {
        if (connection) await connection.end();
    }
};

/**
 * Eliminar categoría (solo admin)
 */
const eliminarCategoria = async (req, res) => {
    let connection;
    
    try {
        // 1. Validar ID
        const { id } = req.params;
        const categoriaId = parseInt(id);

        if (isNaN(categoriaId) || categoriaId <= 0) {
            return res.status(400).json({ msg: 'ID de categoría no válido' });
        }

        // 2. Conexión a BD
        connection = await conectarDB();

        // 3. Verificar que la categoría existe
        const [categoriasExistentes] = await connection.execute(
            'SELECT id FROM categorias WHERE id = ?',
            [categoriaId]
        );

        if (categoriasExistentes.length === 0) {
            return res.status(404).json({ msg: 'Categoría no encontrada' });
        }

        // 4. Verificar que no tiene items asociados
        const [itemsAsociados] = await connection.execute(
            'SELECT COUNT(*) as total FROM items WHERE categoria_id = ?',
            [categoriaId]
        );

        if (itemsAsociados[0].total > 0) {
            return res.status(400).json({ 
                msg: `No se puede eliminar la categoría porque tiene ${itemsAsociados[0].total} items asociados` 
            });
        }

        // 5. Eliminar categoría
        await connection.execute(
            'DELETE FROM categorias WHERE id = ?',
            [categoriaId]
        );

        // 6. Respuesta exitosa
        res.json({ msg: 'Categoría eliminada correctamente' });

    } catch (error) {
        console.log('Error al eliminar categoría:', error);
        res.status(500).json({ msg: 'Error del servidor' });
    } finally {
        if (connection) await connection.end();
    }
};

export {
    obtenerCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
};