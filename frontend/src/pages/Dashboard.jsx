import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import clienteAxios from '../config/axios';

const Dashboard = () => {
    const { auth, cerrarSesion } = useAuth();
    const [estadisticas, setEstadisticas] = useState({
        items: { total_items: 0, items_disponibles: 0, unidades_disponibles: 0 },
        prestamos: { total_prestamos: 0, prestamos_activos: 0, prestamos_vencidos: 0 }
    });
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const obtenerEstadisticas = async () => {
            const token = localStorage.getItem('lab_token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            try {
                // Obtener estadísticas de items
                const { data: statsItems } = await clienteAxios.get('/items/estadisticas', config);
                
                // Obtener estadísticas de préstamos
                const { data: statsPrestamos } = await clienteAxios.get('/prestamos/estadisticas', config);

                setEstadisticas({
                    items: statsItems.estadisticas_generales,
                    prestamos: statsPrestamos.estadisticas_generales
                });
            } catch (error) {
                console.log('Error al obtener estadísticas:', error);
            } finally {
                setCargando(false);
            }
        };

        obtenerEstadisticas();
    }, []);

    if (cargando) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando estadísticas...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            {/* Bienvenida */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card bg-gradient bg-primary text-white">
                        <div className="card-body">
                            <h2 className="fw-bold mb-2">
                                ¡Bienvenido, {auth.nombre}! 👋
                            </h2>
                            <p className="mb-0 opacity-75">
                                Panel de control del Sistema de Gestión de Préstamos
                            </p>
                        </div>
                    </div>
                </div>
            </div>

           {/* Estadísticas Cards - CORREGIDAS */}
            <div className="row g-4 mb-4">
                <div className="col-md-6 col-xl-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" 
                                         style={{width: '48px', height: '48px'}}>
                                        <i className="bi bi-tools text-primary fs-5"></i>
                                    </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <h6 className="text-muted mb-1">Total Items</h6>
                                    <h3 className="mb-0">{estadisticas.items.total_items}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-xl-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" 
                                         style={{width: '48px', height: '48px'}}>
                                        <i className="bi bi-check-circle text-success fs-5"></i>
                                    </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <h6 className="text-muted mb-1">Items Disponibles</h6>
                                    <h3 className="mb-0">{estadisticas.items.items_disponibles}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-xl-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" 
                                         style={{width: '48px', height: '48px'}}>
                                        <i className="bi bi-clipboard-check text-info fs-5"></i>
                                    </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <h6 className="text-muted mb-1">Préstamos Activos</h6>
                                    <h3 className="mb-0">{estadisticas.prestamos.prestamos_activos}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-xl-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-shrink-0">
                                    <div className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" 
                                         style={{width: '48px', height: '48px'}}>
                                        <i className="bi bi-exclamation-triangle text-warning fs-5"></i>
                                    </div>
                                </div>
                                <div className="flex-grow-1 ms-3">
                                    <h6 className="text-muted mb-1">Préstamos Vencidos</h6>
                                    <h3 className="mb-0">{estadisticas.prestamos.prestamos_vencidos}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

           {/* Acciones Rápidas - CÍRCULOS CORREGIDOS */}
            <div className="row g-4">
                <div className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center">
                            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                                 style={{width: '48px', height: '48px'}}>
                                <i className="bi bi-plus-circle text-primary fs-5"></i>
                            </div>
                            <h5 className="card-title">Nuevo Préstamo</h5>
                            <p className="card-text text-muted">
                                Registra un nuevo préstamo de herramientas
                            </p>
                            <Link to="/admin/prestamos" className="btn btn-primary">
                                <i className="bi bi-plus me-2"></i>
                                Crear Préstamo
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center">
                            <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                                 style={{width: '48px', height: '48px'}}>
                                <i className="bi bi-arrow-return-left text-success fs-5"></i>
                            </div>
                            <h5 className="card-title">Devolver Items</h5>
                            <p className="card-text text-muted">
                                Procesa la devolución de herramientas
                            </p>
                            <Link to="/admin/devoluciones" className="btn btn-success">
                                <i className="bi bi-search me-2"></i>
                                Buscar Préstamo
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center">
                            <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                                 style={{width: '48px', height: '48px'}}>
                                <i className="bi bi-list-check text-info fs-5"></i>
                            </div>
                            <h5 className="card-title">Gestionar Inventario</h5>
                            <p className="card-text text-muted">
                                Administra items y categorías
                            </p>
                            <Link to="/admin/items" className="btn btn-info">
                                <i className="bi bi-gear me-2"></i>
                                Ver Inventario
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Card adicional para ver todos los préstamos */}
                <div className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body text-center">
                            <div className="bg-secondary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                                 style={{width: '48px', height: '48px'}}>
                                <i className="bi bi-clipboard-data text-secondary fs-5"></i>
                            </div>
                            <h5 className="card-title">Historial de Préstamos</h5>
                            <p className="card-text text-muted">
                                Consulta todos los préstamos registrados
                            </p>
                            <Link to="/admin/prestamos" className="btn btn-secondary">
                                <i className="bi bi-list me-2"></i>
                                Ver Historial
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Card de estadísticas rápidas */}
                <div className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                            <h5 className="card-title">
                                <i className="bi bi-graph-up text-primary me-2"></i>
                                Resumen Rápido
                            </h5>
                            <div className="row g-2 text-center">
                                <div className="col-6">
                                    <div className="p-2 bg-light rounded">
                                        <div className="fw-bold text-primary">{estadisticas.items.unidades_disponibles}</div>
                                        <small className="text-muted">Unidades Disponibles</small>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="p-2 bg-light rounded">
                                        <div className="fw-bold text-success">{estadisticas.prestamos.prestamos_completados || 0}</div>
                                        <small className="text-muted">Completados</small>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="p-2 bg-light rounded">
                                        <div className="fw-bold text-warning">{estadisticas.prestamos.prestamos_parciales || 0}</div>
                                        <small className="text-muted">Parciales</small>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="p-2 bg-light rounded">
                                        <div className="fw-bold text-info">{estadisticas.prestamos.total_prestamos}</div>
                                        <small className="text-muted">Total Préstamos</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card de acceso rápido para administradores */}
                {auth.tipo === 'admin' && (
                    <div className="col-md-6 col-lg-4">
                        <div className="card border-0 shadow-sm h-100 border-warning">
                            <div className="card-body text-center">
                                <div className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                                     style={{width: '48px', height: '48px'}}>
                                    <i className="bi bi-people text-warning fs-5"></i>
                                </div>
                                <h5 className="card-title">Gestión de Usuarios</h5>
                                <p className="card-text text-muted">
                                    Administra usuarios del sistema
                                </p>
                                <Link to="/admin/usuarios" className="btn btn-warning">
                                    <i className="bi bi-people me-2"></i>
                                    Gestionar Usuarios
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Información adicional para el usuario */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="row align-items-center">
                                <div className="col-md-8">
                                    <h6 className="mb-2">
                                        <i className="bi bi-info-circle text-primary me-2"></i>
                                        Información del Sistema
                                    </h6>
                                    <p className="text-muted mb-0">
                                        Estás conectado como <strong>{auth.nombre}</strong> ({auth.tipo}). 
                                        El sistema permite gestionar préstamos de herramientas de laboratorio de forma eficiente 
                                        con seguimiento completo de inventario y devoluciones.
                                    </p>
                                </div>
                                <div className="col-md-4 text-md-end">
                                    <small className="text-muted">
                                        <i className="bi bi-calendar3 me-1"></i>
                                        {new Date().toLocaleDateString('es-ES', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Footer profesional con derechos de autor */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm border-primary border-opacity-25">
                        <div className="card-body">
                            <div className="row align-items-center">
                                <div className="col-md-8">
                                    <div className="d-flex align-items-center mb-2">
                                        <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" 
                                             style={{width: '40px', height: '40px'}}>
                                            <i className="bi bi-person-gear text-primary"></i>
                                        </div>
                                        <div>
                                            <h6 className="mb-0">
                                                Sistema de Gestión de Préstamos - Laboratorio de Informática
                                            </h6>
                                            <small className="text-primary">SGPLI v1.0.0</small>
                                        </div>
                                    </div>
                                    <p className="text-muted mb-1">
                                        <strong>Desarrollado por:</strong> Lic. Javier Bálcazar Cruz
                                    </p>
                                    <small className="text-muted">
                                        <i className="bi bi-c-circle me-1"></i>
                                        © 2025 • Todos los derechos reservados • 
                                        Prohibida su reproducción total o parcial sin autorización expresa del autor
                                    </small>
                                </div>
                                <div className="col-md-4 text-md-end">
                                    <div className="d-flex flex-column align-items-md-end">
                                        <small className="text-muted mb-1">
                                            <i className="bi bi-calendar-event me-1"></i>
                                            {new Date().toLocaleDateString('es-ES', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </small>
                                        <small className="text-muted mb-1">
                                            <i className="bi bi-clock me-1"></i>
                                            {new Date().toLocaleTimeString('es-ES', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </small>
                                        <div className="badge bg-primary bg-opacity-10 text-primary">
                                            <i className="bi bi-shield-check me-1"></i>
                                            Sistema Seguro
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;