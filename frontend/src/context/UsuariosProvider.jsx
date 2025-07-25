// En: frontend/src/context/UsuariosProvider.jsx
import { useState, useEffect, createContext } from 'react';
import useAuth from '../hooks/useAuth'; // ← AGREGAR ESTA LÍNEA
import clienteAxios from '../config/axios';
import Swal from 'sweetalert2';

const UsuariosContext = createContext();

const UsuariosProvider = ({ children }) => {
    const { auth } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);

    // Obtener token para las peticiones
    const getConfig = () => ({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('lab_token')}`
        }
    });

    // Obtener todos los usuarios
    const obtenerUsuarios = async () => {
        try {
            setCargando(true);
            const { data } = await clienteAxios.get('/auth/usuarios', getConfig());
            setUsuarios(data);
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            mostrarError('Error al cargar usuarios');
            setUsuarios([]);
        } finally {
            setCargando(false);
        }
    };

    // Crear nuevo usuario
    const crearUsuario = async (usuarioData) => {
        try {
            const { data } = await clienteAxios.post('/auth/registro', usuarioData, getConfig());
            
            // Agregar al estado local
            const nuevoUsuario = {
                ...data.usuario,
                activo: 1,
                fecha_creacion: new Date().toISOString()
            };
            
            setUsuarios(prevUsuarios => [nuevoUsuario, ...prevUsuarios]);
            
            mostrarExito('Usuario creado correctamente');
            return { success: true, usuario: nuevoUsuario };
        } catch (error) {
            const mensaje = error.response?.data?.msg || 'Error al crear usuario';
            mostrarError(mensaje);
            return { success: false, error: mensaje };
        }
    };

    // Activar/Desactivar usuario
    const toggleUsuario = async (id) => {
        try {
            const usuario = usuarios.find(u => u.id === id);
            if (!usuario) {
                mostrarError('Usuario no encontrado');
                return { success: false };
            }

            const accion = usuario.activo ? 'desactivar' : 'activar';
            
            const confirmacion = await mostrarConfirmacion(
                `¿Estás seguro?`,
                `Esta acción ${accion}á al usuario ${usuario.nombre}`
            );

            if (!confirmacion) return { success: false };

            const { data } = await clienteAxios.put(`/auth/usuarios/${id}/toggle`, {}, getConfig());
            
            // Actualizar en el estado local
            setUsuarios(prevUsuarios => 
                prevUsuarios.map(u => 
                    u.id === id ? { ...u, activo: data.activo } : u
                )
            );
            
            mostrarExito(`Usuario ${data.activo ? 'activado' : 'desactivado'} correctamente`);
            return { success: true };
        } catch (error) {
            const mensaje = error.response?.data?.msg || 'Error al cambiar estado del usuario';
            mostrarError(mensaje);
            return { success: false, error: mensaje };
        }
    };

    // Actualizar información de usuario
    const actualizarUsuario = async (id, usuarioData) => {
        try {
            const { data } = await clienteAxios.put(`/auth/usuarios/${id}`, usuarioData, getConfig());
            
            // Actualizar en el estado local
            setUsuarios(prevUsuarios => 
                prevUsuarios.map(u => 
                    u.id === id ? { ...u, ...data.usuario } : u
                )
            );
            
            mostrarExito('Usuario actualizado correctamente');
            return { success: true, usuario: data.usuario };
        } catch (error) {
            const mensaje = error.response?.data?.msg || 'Error al actualizar usuario';
            mostrarError(mensaje);
            return { success: false, error: mensaje };
        }
    };

    // Buscar usuarios por término
    const buscarUsuarios = (termino) => {
        if (!termino || termino.trim() === '') {
            return usuarios;
        }

        const terminoLower = termino.toLowerCase();
        return usuarios.filter(usuario =>
            usuario.nombre.toLowerCase().includes(terminoLower) ||
            usuario.email.toLowerCase().includes(terminoLower) ||
            usuario.tipo.toLowerCase().includes(terminoLower)
        );
    };

    // Filtrar usuarios por estado
    const filtrarPorEstado = (estado) => {
        if (estado === 'todos') return usuarios;
        const activo = estado === 'activos' ? 1 : 0;
        return usuarios.filter(usuario => usuario.activo === activo);
    };

    // Filtrar usuarios por tipo
    const filtrarPorTipo = (tipo) => {
        if (tipo === 'todos') return usuarios;
        return usuarios.filter(usuario => usuario.tipo === tipo);
    };

    // Obtener estadísticas de usuarios
    const obtenerEstadisticasUsuarios = () => {
        const total = usuarios.length;
        const activos = usuarios.filter(u => u.activo === 1).length;
        const inactivos = usuarios.filter(u => u.activo === 0).length;
        const admins = usuarios.filter(u => u.tipo === 'admin').length;
        const encargados = usuarios.filter(u => u.tipo === 'encargado').length;

        return {
            total,
            activos,
            inactivos,
            admins,
            encargados
        };
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
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar'
        });

        return result.isConfirmed;
    };

    // Cargar usuarios solo cuando el usuario esté autenticado y sea admin
    useEffect(() => {
        const cargarUsuarios = async () => {
            if (auth?.id && auth?.tipo === 'admin') {
                await obtenerUsuarios();
            } else {
                setUsuarios([]);
                setCargando(false);
            }
        };
        
        cargarUsuarios();
    }, [auth?.id, auth?.tipo]);

    return (
        <UsuariosContext.Provider value={{
            // Estado
            usuarios,
            cargando,
            
            // Funciones principales
            obtenerUsuarios,
            crearUsuario,
            actualizarUsuario,
            toggleUsuario,
            
            // Funciones de búsqueda y filtrado
            buscarUsuarios,
            filtrarPorEstado,
            filtrarPorTipo,
            obtenerEstadisticasUsuarios,
            
            // Utilidades
            mostrarExito,
            mostrarError,
            mostrarConfirmacion
        }}>
            {children}
        </UsuariosContext.Provider>
    );
};

export { UsuariosProvider };
export default UsuariosContext;