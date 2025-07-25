// En: frontend/src/context/ItemsProvider.jsx
import { useState, useEffect, createContext } from 'react';
import useAuth from '../hooks/useAuth'; // ← AGREGAR ESTA LÍNEA
import clienteAxios from '../config/axios';
import Swal from 'sweetalert2';

const ItemsContext = createContext();

const ItemsProvider = ({ children }) => {
    const { auth } = useAuth(); // ← AGREGAR ESTO
    const [items, setItems] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [estadisticas, setEstadisticas] = useState({});

    // Obtener token para las peticiones
    const getConfig = () => ({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('lab_token')}`
        }
    });

    // Obtener todos los items
    const obtenerItems = async (filtros = {}) => {
        try {
            setCargando(true);
            const params = new URLSearchParams(filtros).toString();
            const url = params ? `/items?${params}` : '/items';
            
            const { data } = await clienteAxios.get(url, getConfig());
            setItems(data.items || data);
        } catch (error) {
            console.error('Error al obtener items:', error);
            mostrarError('Error al cargar items');
        } finally {
            setCargando(false);
        }
    };

    // Obtener categorías
    const obtenerCategorias = async () => {
        try {
            const { data } = await clienteAxios.get('/items/categorias/todas', getConfig());
            setCategorias(data);
        } catch (error) {
            console.error('Error al obtener categorías:', error);
        }
    };

    // Obtener estadísticas
    const obtenerEstadisticas = async () => {
        try {
            const { data } = await clienteAxios.get('/items/estadisticas', getConfig());
            setEstadisticas(data);
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
        }
    };

    // Crear item
    const crearItem = async (itemData) => {
        try {
            const { data } = await clienteAxios.post('/items', itemData, getConfig());
            
            // Agregar al estado local
            setItems(prevItems => [data.item, ...prevItems]);
            
            mostrarExito('Item creado correctamente');
            return { success: true, item: data.item };
        } catch (error) {
            const mensaje = error.response?.data?.msg || 'Error al crear item';
            mostrarError(mensaje);
            return { success: false, error: mensaje };
        }
    };

    // Actualizar item
    const actualizarItem = async (id, itemData) => {
        try {
            const { data } = await clienteAxios.put(`/items/${id}`, itemData, getConfig());
            
            // Actualizar en el estado local
            setItems(prevItems => 
                prevItems.map(item => 
                    item.id === id ? data.item : item
                )
            );
            
            mostrarExito('Item actualizado correctamente');
            return { success: true, item: data.item };
        } catch (error) {
            const mensaje = error.response?.data?.msg || 'Error al actualizar item';
            mostrarError(mensaje);
            return { success: false, error: mensaje };
        }
    };

    // Eliminar item (dar de baja)
    const eliminarItem = async (id) => {
        try {
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: 'Esta acción dará de baja el item del inventario',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, dar de baja',
                cancelButtonText: 'Cancelar'
            });

            if (!result.isConfirmed) return { success: false };

            await clienteAxios.delete(`/items/${id}`, getConfig());
            
            // Remover del estado local
            setItems(prevItems => prevItems.filter(item => item.id !== id));
            
            mostrarExito('Item dado de baja correctamente');
            return { success: true };
        } catch (error) {
            const mensaje = error.response?.data?.msg || 'Error al eliminar item';
            mostrarError(mensaje);
            return { success: false, error: mensaje };
        }
    };

    // Crear categoría
    const crearCategoria = async (categoriaData) => {
        try {
            const { data } = await clienteAxios.post('/items/categorias', categoriaData, getConfig());
            
            setCategorias(prevCategorias => [data.categoria, ...prevCategorias]);
            mostrarExito('Categoría creada correctamente');
            return { success: true, categoria: data.categoria };
        } catch (error) {
            const mensaje = error.response?.data?.msg || 'Error al crear categoría';
            mostrarError(mensaje);
            return { success: false, error: mensaje };
        }
    };

    // Actualizar categoría
    const actualizarCategoria = async (id, categoriaData) => {
        try {
            const { data } = await clienteAxios.put(`/items/categorias/${id}`, categoriaData, getConfig());
            
            setCategorias(prevCategorias => 
                prevCategorias.map(cat => 
                    cat.id === id ? data.categoria : cat
                )
            );
            
            mostrarExito('Categoría actualizada correctamente');
            return { success: true, categoria: data.categoria };
        } catch (error) {
            const mensaje = error.response?.data?.msg || 'Error al actualizar categoría';
            mostrarError(mensaje);
            return { success: false, error: mensaje };
        }
    };

    // Eliminar categoría
    const eliminarCategoria = async (id) => {
        try {
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: 'Esta acción eliminará la categoría permanentemente',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });

            if (!result.isConfirmed) return { success: false };

            await clienteAxios.delete(`/items/categorias/${id}`, getConfig());
            
            setCategorias(prevCategorias => 
                prevCategorias.filter(cat => cat.id !== id)
            );
            
            mostrarExito('Categoría eliminada correctamente');
            return { success: true };
        } catch (error) {
            const mensaje = error.response?.data?.msg || 'Error al eliminar categoría';
            mostrarError(mensaje);
            return { success: false, error: mensaje };
        }
    };

    // Utilidades para alertas
    const mostrarExito = (mensaje) => {
        Swal.fire({
            title: '¡Éxito!',
            text: mensaje,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
    };

    const mostrarError = (mensaje) => {
        Swal.fire({
            title: 'Error',
            text: mensaje,
            icon: 'error',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#dc3545'
        });
    };

    // ✅ CARGAR DATOS SOLO CUANDO EL USUARIO ESTÉ AUTENTICADO
    useEffect(() => {
        const cargarDatos = async () => {
            // ← SOLO CARGAR SI HAY USUARIO AUTENTICADO
            if (auth?.id) {
                await Promise.all([
                    obtenerItems(),
                    obtenerCategorias(),
                    obtenerEstadisticas()
                ]);
            } else {
                // Si no hay usuario, limpiar estados
                setItems([]);
                setCategorias([]);
                setEstadisticas({});
                setCargando(false);
            }
        };
        
        cargarDatos();
    }, [auth?.id]); // ← DEPENDENCIA: auth?.id

    return (
        <ItemsContext.Provider value={{
            // Estado
            items,
            categorias,
            estadisticas,
            cargando,
            
            // Funciones de items
            obtenerItems,
            crearItem,
            actualizarItem,
            eliminarItem,
            
            // Funciones de categorías
            obtenerCategorias,
            crearCategoria,
            actualizarCategoria,
            eliminarCategoria,
            
            // Funciones de estadísticas
            obtenerEstadisticas
        }}>
            {children}
        </ItemsContext.Provider>
    );
};

export { ItemsProvider };
export default ItemsContext;