import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import ModalEditarPerfil from '../components/perfil/ModalEditarPerfil';
import ModalCambiarPassword from '../components/perfil/ModalCambiarPassword';
import clienteAxios from '../config/axios';

const Perfil = () => {
    const { auth } = useAuth();
    const [historialActividades, setHistorialActividades] = useState([]);
    const [estadisticasPersonales, setEstadisticasPersonales] = useState({});
    const [mostrarModalPerfil, setMostrarModalPerfil] = useState(false);
    const [mostrarModalPassword, setMostrarModalPassword] = useState(false);
    const [cargandoHistorial, setCargandoHistorial] = useState(true);

    // Obtener token para las peticiones
    const getConfig = () => ({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('lab_token')}`
        }
    });

    // Obtener historial de actividades del usuario
    const obtenerHistorialActividades = async () => {
        try {
            setCargandoHistorial(true);
            const { data } = await clienteAxios.get('/auth/mi-historial', getConfig());
            setHistorialActividades(data.historial || []);
        } catch (error) {
            console.error('Error al obtener historial:', error);
            setHistorialActividades([]);
        } finally {
            setCargandoHistorial(false);
        }
    };

    // Obtener estadísticas personales del usuario
    const obtenerEstadisticasPersonales = async () => {
        try {
            const { data } = await clienteAxios.get('/auth/mis-estadisticas', getConfig());
            setEstadisticasPersonales(data || {});
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            setEstadisticasPersonales({});
        }
    };

    useEffect(() => {
        if (auth?.id) {
            obtenerHistorialActividades();
            obtenerEstadisticasPersonales();
        }
    }, [auth?.id]);

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTipoIcono = (tipo) => {
        const iconos = {
            'prestamo': 'bi-clipboard-plus text-primary',
            'devolucion': 'bi-arrow-return-left text-success',
            'ajuste': 'bi-gear text-warning',
            'login': 'bi-box-arrow-in-right text-info'
        };
        return iconos[tipo] || 'bi-circle text-secondary';
    };

    const getTipoLabel = (tipo) => {
        const labels = {
            'prestamo': 'Préstamo Creado',
            'devolucion': 'Devolución Procesada',
            'ajuste': 'Ajuste de Inventario',
            'login': 'Inicio de Sesión'
        };
        return labels[tipo] || tipo;
    };

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="mb-1">
                                <i className="bi bi-person-circle text-primary me-3"></i>
                                Mi Perfil
                            </h2>
                            <p className="text-muted mb-0">
                                Gestiona tu información personal y revisa tu actividad
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* Información Personal */}
                <div className="col-lg-4">
                    <div className="card shadow-sm h-100">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">
                                <i className="bi bi-person-gear me-2"></i>
                                Información Personal
                            </h5>
                        </div>
                        <div className="card-body text-center">
                            {/* Avatar */}
                            <div className="mb-4">
                                <div className="bg-primary bg-opacity-10 rounded-circle mx-auto d-flex align-items-center justify-content-center" 
                                     style={{width: '120px', height: '120px'}}>
                                    <i className="bi bi-person text-primary" style={{fontSize: '4rem'}}></i>
                                </div>
                            </div>

                            {/* Datos del Usuario */}
                            <h4 className="mb-2">{auth.nombre}</h4>
                            <p className="text-muted mb-3">{auth.email}</p>
                            
                            <div className="mb-4">
                                <span className={`badge ${auth.tipo === 'admin' ? 'bg-danger' : 'bg-primary'} fs-6`}>
                                    {auth.tipo === 'admin' ? 'Administrador' : 'Encargado'}
                                </span>
                            </div>

                            {/* Botones de Acción */}
                            <div className="d-grid gap-2">
                                <button 
                                    className="btn btn-outline-primary"
                                    onClick={() => setMostrarModalPerfil(true)}
                                >
                                    <i className="bi bi-pencil me-2"></i>
                                    Editar Perfil
                                </button>
                                <button 
                                    className="btn btn-outline-warning"
                                    onClick={() => setMostrarModalPassword(true)}
                                >
                                    <i className="bi bi-key me-2"></i>
                                    Cambiar Contraseña
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estadísticas y Actividad */}
                <div className="col-lg-8">
                    {/* Estadísticas Personales */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <i className="bi bi-graph-up text-info me-2"></i>
                                Mis Estadísticas
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-3">
                                    <div className="text-center p-3 bg-primary bg-opacity-10 rounded">
                                        <i className="bi bi-clipboard-check text-primary fs-1 mb-2"></i>
                                        <h4 className="mb-1">{estadisticasPersonales.prestamos_creados || 0}</h4>
                                        <small className="text-muted">Préstamos Creados</small>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="text-center p-3 bg-success bg-opacity-10 rounded">
                                        <i className="bi bi-arrow-return-left text-success fs-1 mb-2"></i>
                                        <h4 className="mb-1">{estadisticasPersonales.devoluciones_procesadas || 0}</h4>
                                        <small className="text-muted">Devoluciones</small>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="text-center p-3 bg-warning bg-opacity-10 rounded">
                                        <i className="bi bi-tools text-warning fs-1 mb-2"></i>
                                        <h4 className="mb-1">{estadisticasPersonales.items_gestionados || 0}</h4>
                                        <small className="text-muted">Items Gestionados</small>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="text-center p-3 bg-info bg-opacity-10 rounded">
                                        <i className="bi bi-calendar3 text-info fs-1 mb-2"></i>
                                        <h4 className="mb-1">{estadisticasPersonales.dias_activo || 0}</h4>
                                        <small className="text-muted">Días Activo</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Historial de Actividades */}
                    <div className="card shadow-sm">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                <i className="bi bi-clock-history text-secondary me-2"></i>
                                Historial de Actividades
                            </h5>
                            <button 
                                className="btn btn-sm btn-outline-secondary"
                                onClick={obtenerHistorialActividades}
                                disabled={cargandoHistorial}
                            >
                                <i className="bi bi-arrow-clockwise me-1"></i>
                                Actualizar
                            </button>
                        </div>
                        <div className="card-body">
                            {cargandoHistorial ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Cargando historial...</span>
                                    </div>
                                </div>
                            ) : historialActividades.length === 0 ? (
                                <div className="text-center py-4 text-muted">
                                    <i className="bi bi-clock-history fs-1 d-block mb-2"></i>
                                    <p>No hay actividades registradas</p>
                                </div>
                            ) : (
                                <div className="timeline" style={{maxHeight: '400px', overflowY: 'auto'}}>
                                    {historialActividades.map((actividad, index) => (
                                        <div key={index} className="d-flex mb-3">
                                            <div className="flex-shrink-0 me-3">
                                                <div className="bg-light rounded-circle p-2">
                                                    <i className={`bi ${getTipoIcono(actividad.tipo)}`}></i>
                                                </div>
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="card border-0 bg-light">
                                                    <div className="card-body p-3">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <h6 className="mb-1">{getTipoLabel(actividad.tipo)}</h6>
                                                            <small className="text-muted">
                                                                {formatearFecha(actividad.fecha)}
                                                            </small>
                                                        </div>
                                                        <p className="mb-1 text-muted">
                                                            {actividad.descripcion || actividad.observaciones || 'Sin descripción'}
                                                        </p>
                                                        {actividad.item_nombre && (
                                                            <div className="mt-2">
                                                                <span className="badge bg-secondary">
                                                                    {actividad.item_nombre}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modales */}
            <ModalEditarPerfil 
                mostrar={mostrarModalPerfil}
                onCerrar={() => setMostrarModalPerfil(false)}
                usuario={auth}
            />

            <ModalCambiarPassword 
                mostrar={mostrarModalPassword}
                onCerrar={() => setMostrarModalPassword(false)}
            />
        </div>
    );
};

export default Perfil;