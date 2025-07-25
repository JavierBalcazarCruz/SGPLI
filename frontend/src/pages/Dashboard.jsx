import { useState, useEffect } from 'react';
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

    const handleCerrarSesion = () => {
        cerrarSesion();
    };

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
        <div className="min-vh-100 bg-light">
            {/* Header */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
                <div className="container-fluid">
                    <span className="navbar-brand mb-0 h1">
                        <i className="bi bi-gear-fill me-2"></i>
                        Sistema Laboratorio
                    </span>
                    
                    <div className="d-flex align-items-center">
                        <div className="dropdown">
                            <button
                                className="btn btn-outline-light dropdown-toggle"
                                type="button"
                                id="dropdownMenuButton"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <i className="bi bi-person-circle me-2"></i>
                                {auth.nombre}
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
                                <li>
                                    <span className="dropdown-item-text">
                                        <small className="text-muted">Tipo: {auth.tipo}</small>
                                    </span>
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                    <button className="dropdown-item" type="button">
                                        <i className="bi bi-person-gear me-2"></i>
                                        Mi Perfil
                                    </button>
                                </li>
                                <li>
                                    <button className="dropdown-item" type="button">
                                        <i className="bi bi-key me-2"></i>
                                        Cambiar Contraseña
                                    </button>
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                    <button 
                                        className="dropdown-item text-danger" 
                                        type="button"
                                        onClick={handleCerrarSesion}
                                    >
                                        <i className="bi bi-box-arrow-right me-2"></i>
                                        Cerrar Sesión
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
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

                {/* Estadísticas Cards */}
                <div className="row g-4 mb-4">
                    <div className="col-md-6 col-xl-3">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                                            <i className="bi bi-tools text-primary fs-4"></i>
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
                                        <div className="bg-success bg-opacity-10 rounded-circle p-3">
                                            <i className="bi bi-check-circle text-success fs-4"></i>
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
                                        <div className="bg-info bg-opacity-10 rounded-circle p-3">
                                            <i className="bi bi-clipboard-check text-info fs-4"></i>
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
                                        <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                                            <i className="bi bi-exclamation-triangle text-warning fs-4"></i>
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

                {/* Acciones Rápidas */}
                <div className="row g-4">
                    <div className="col-md-6 col-lg-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body text-center">
                                <div className="bg-primary bg-opacity-10 rounded-circle p-4 mx-auto mb-3" style={{width: 'fit-content'}}>
                                    <i className="bi bi-plus-circle text-primary" style={{fontSize: '2rem'}}></i>
                                </div>
                                <h5 className="card-title">Nuevo Préstamo</h5>
                                <p className="card-text text-muted">
                                    Registra un nuevo préstamo de herramientas
                                </p>
                                <button className="btn btn-primary">
                                    <i className="bi bi-plus me-2"></i>
                                    Crear Préstamo
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6 col-lg-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body text-center">
                                <div className="bg-success bg-opacity-10 rounded-circle p-4 mx-auto mb-3" style={{width: 'fit-content'}}>
                                    <i className="bi bi-arrow-return-left text-success" style={{fontSize: '2rem'}}></i>
                                </div>
                                <h5 className="card-title">Devolver Items</h5>
                                <p className="card-text text-muted">
                                    Procesa la devolución de herramientas
                                </p>
                                <button className="btn btn-success">
                                    <i className="bi bi-search me-2"></i>
                                    Buscar Préstamo
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6 col-lg-4">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="card-body text-center">
                                <div className="bg-info bg-opacity-10 rounded-circle p-4 mx-auto mb-3" style={{width: 'fit-content'}}>
                                    <i className="bi bi-list-check text-info" style={{fontSize: '2rem'}}></i>
                                </div>
                                <h5 className="card-title">Gestionar Inventario</h5>
                                <p className="card-text text-muted">
                                    Administra items y categorías
                                </p>
                                <button className="btn btn-info">
                                    <i className="bi bi-gear me-2"></i>
                                    Ver Inventario
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;