// En: frontend/src/context/PrestamosProvider.jsx
import { useState, useEffect, createContext } from 'react';
import useAuth from '../hooks/useAuth'; // ← AGREGAR ESTA LÍNEA
import clienteAxios from '../config/axios';
import Swal from 'sweetalert2';

const PrestamosContext = createContext();

const PrestamosProvider = ({ children }) => {
    const { auth } = useAuth(); // ← AGREGAR ESTO
    const [prestamos, setPrestamos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [estadisticas, setEstadisticas] = useState({});
    const [prestamoActual, setPrestamoActual] = useState(null);

    // Obtener token para las peticiones
    const getConfig = () => ({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('lab_token')}`
        }
    });

    // Obtener todos los préstamos con filtros
    const obtenerPrestamos = async (filtros = {}) => {
        try {
            setCargando(true);
            const params = new URLSearchParams(filtros).toString();
            const url = params ? `/prestamos?${params}` : '/prestamos';
            
            const { data } = await clienteAxios.get(url, getConfig());
            setPrestamos(data.prestamos || []);
            return data;
        } catch (error) {
            console.error('Error al obtener préstamos:', error);
            mostrarError('Error al cargar préstamos');
            return { prestamos: [], paginacion: {} };
        } finally {
            setCargando(false);
        }
    };

    // Obtener usuarios disponibles para préstamos
    const obtenerUsuarios = async () => {
        try {
            const { data } = await clienteAxios.get('/auth/usuarios', getConfig());
            setUsuarios(data.filter(usuario => usuario.activo === 1));
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
        }
    };

    // Obtener estadísticas de préstamos
    const obtenerEstadisticasPrestamos = async () => {
        try {
            const { data } = await clienteAxios.get('/prestamos/estadisticas', getConfig());
            setEstadisticas(data);
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
        }
    };

    // Crear nuevo préstamo
    const crearPrestamo = async (prestamoData) => {
        try {
            const { data } = await clienteAxios.post('/prestamos', prestamoData, getConfig());
            
            // Agregar al estado local
            setPrestamos(prevPrestamos => [data.prestamo, ...prevPrestamos]);
            
            // Mostrar voucher con el código
            Swal.fire({
                title: '¡Préstamo Creado!',
                html: `
                    <div class="text-center">
                        <p class="mb-3">El préstamo se ha registrado exitosamente</p>
                        <div class="card bg-light p-3">
                            <h4 class="text-primary mb-0">
                                <i class="bi bi-ticket-perforated me-2"></i>
                                ${data.voucher_codigo}
                            </h4>
                            <small class="text-muted">Código de voucher</small>
                        </div>
                        <p class="mt-3 text-muted">
                            <small>Guarda este código para futuras consultas</small>
                        </p>
                    </div>
                `,
                icon: 'success',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#0d6efd'
            });
            
            return { success: true, prestamo: data.prestamo, codigo: data.voucher_codigo };
        } catch (error) {
            const mensaje = error.response?.data?.msg || 'Error al crear préstamo';
            mostrarError(mensaje);
            return { success: false, error: mensaje };
        }
    };

    // Buscar préstamo por código (voucher)
    const buscarPrestamoPorCodigo = async (codigo) => {
        try {
            setCargando(true);
            const { data } = await clienteAxios.get(`/prestamos/voucher/${codigo}`, getConfig());
            setPrestamoActual(data.prestamo);
            return { success: true, prestamo: data.prestamo };
        } catch (error) {
            const mensaje = error.response?.data?.msg || 'Préstamo no encontrado';
            mostrarError(mensaje);
            setPrestamoActual(null);
            return { success: false, error: mensaje };
        } finally {
            setCargando(false);
        }
    };

    // Devolver items de un préstamo
    const devolverItems = async (codigo, itemsDevueltos, observaciones = '') => {
        try {
            const { data } = await clienteAxios.put(
                `/prestamos/${codigo}/devolver`,
                {
                    items_devueltos: itemsDevueltos,
                    observaciones
                },
                getConfig()
            );

            // Actualizar préstamo actual si es el mismo
            if (prestamoActual && prestamoActual.codigo === codigo) {
                setPrestamoActual(data.prestamo);
            }

            // Actualizar en la lista de préstamos
            setPrestamos(prevPrestamos => 
                prevPrestamos.map(prestamo => 
                    prestamo.codigo === codigo ? data.prestamo : prestamo
                )
            );

            mostrarExito(`${data.items_devueltos.length} item(s) devuelto(s) correctamente`);
            return { success: true, prestamo: data.prestamo };
        } catch (error) {
            const mensaje = error.response?.data?.msg || 'Error al devolver items';
            mostrarError(mensaje);
            return { success: false, error: mensaje };
        }
    };

    // Obtener préstamos del usuario actual (para encargados)
    const obtenerMisPrestamos = async () => {
        try {
            const { data } = await clienteAxios.get('/prestamos?mi_usuario=true', getConfig());
            return data.prestamos || [];
        } catch (error) {
            console.error('Error al obtener mis préstamos:', error);
            return [];
        }
    };

    // Buscar usuarios por nombre/email (para el buscador)
    const buscarUsuarios = async (termino) => {
        try {
            if (!termino || termino.length < 2) return [];
            
            const usuarios = await obtenerUsuarios();
            return usuarios.filter(usuario => 
                usuario.nombre.toLowerCase().includes(termino.toLowerCase()) ||
                usuario.email.toLowerCase().includes(termino.toLowerCase())
            );
        } catch (error) {
            console.error('Error al buscar usuarios:', error);
            return [];
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

    const mostrarConfirmacion = async (titulo, texto) => {
        const result = await Swal.fire({
            title: titulo,
            text: texto,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0d6efd',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar'
        });

        return result.isConfirmed;
    };

    // Limpiar préstamo actual
    const limpiarPrestamoActual = () => {
        setPrestamoActual(null);
    };

    // ✅ CARGAR DATOS SOLO CUANDO EL USUARIO ESTÉ AUTENTICADO
    useEffect(() => {
        const cargarDatos = async () => {
            // ← SOLO CARGAR SI HAY USUARIO AUTENTICADO
            if (auth?.id) {
                await Promise.all([
                    obtenerPrestamos(),
                    obtenerUsuarios(),
                    obtenerEstadisticasPrestamos()
                ]);
            } else {
                // Si no hay usuario, limpiar estados
                setPrestamos([]);
                setUsuarios([]);
                setEstadisticas({});
                setCargando(false);
            }
        };
        
        cargarDatos();
    }, [auth?.id]); // ← DEPENDENCIA: auth?.id

    return (
        <PrestamosContext.Provider value={{
            // Estado
            prestamos,
            usuarios,
            estadisticas,
            cargando,
            prestamoActual,
            
            // Funciones principales
            obtenerPrestamos,
            crearPrestamo,
            buscarPrestamoPorCodigo,
            devolverItems,
            
            // Funciones auxiliares
            obtenerUsuarios,
            obtenerEstadisticasPrestamos,
            obtenerMisPrestamos,
            buscarUsuarios,
            limpiarPrestamoActual,
            
            // Utilidades
            mostrarExito,
            mostrarError,
            mostrarConfirmacion
        }}>
            {children}
        </PrestamosContext.Provider>
    );
};

export { PrestamosProvider };
export default PrestamosContext;