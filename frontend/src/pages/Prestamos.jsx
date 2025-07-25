import { useState, useEffect } from 'react';
import usePrestamos from '../hooks/usePrestamos';
import useAuth from '../hooks/useAuth';
import ModalPrestamo from '../components/prestamos/ModalPrestamo';
import FiltrosPrestamos from '../components/prestamos/FiltrosPrestamos';

const Prestamos = () => {
    const { auth } = useAuth();
    const { 
        prestamos, 
        cargando, 
        obtenerPrestamos, 
        estadisticas 
    } = usePrestamos();

    const [mostrarModal, setMostrarModal] = useState(false);
    const [filtros, setFiltros] = useState({});
    const [paginacion, setPaginacion] = useState({
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 0
    });

    // Cargar préstamos cuando cambien los filtros
    useEffect(() => {
        const cargarPrestamos = async () => {
            const resultado = await obtenerPrestamos({
                ...filtros,
                page: paginacion.page,
                limit: paginacion.limit
            });
            
            if (resultado.paginacion) {
                setPaginacion(resultado.paginacion);
            }
        };

        cargarPrestamos();
    }, [filtros, paginacion.page]);

    const handleFiltrosChange = (nuevosFiltros) => {
        setFiltros(nuevosFiltros);
        setPaginacion(prev => ({ ...prev, page: 1 })); // Reset a página 1
    };

    const handlePaginaChange = (nuevaPagina) => {
        setPaginacion(prev => ({ ...prev, page: nuevaPagina }));
    };

    const getEstadoBadge = (estado) => {
        const badges = {
            'activo': 'bg-primary',
            'parcial': 'bg-warning',
            'completado': 'bg-success',
            'vencido': 'bg-danger'
        };
        return badges[estado] || 'bg-secondary';
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (cargando) {
        return (
            <div className="container-fluid py-4">
                <div className="d-flex justify-content-center align-items-center" style={{minHeight: '400px'}}>
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Cargando préstamos...</span>
                        </div>
                        <p className="mt-3 text-muted">Cargando préstamos...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="mb-1">
                                <i className="bi bi-clipboard-check text-primary me-3"></i>
                                Gestión de Préstamos
                            </h2>
                            <p className="text-muted mb-0">
                                Administra los préstamos de herramientas del laboratorio
                            </p>
                        </div>
                        <button 
                            className="btn btn-primary"
                            onClick={() => setMostrarModal(true)}
                        >
                            <i className="bi bi-plus-circle me-2"></i>
                            Nuevo Préstamo
                        </button>
                    </div>
                </div>
            </div>

            {/* Estadísticas Rápidas */}
          {/* Estadísticas Rápidas - CÍRCULOS CORREGIDOS */}
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" 
                                     style={{width: '48px', height: '48px'}}>
                                    <i className="bi bi-clipboard-check text-primary fs-5"></i>
                                </div>
                                <div>
                                    <h6 className="text-muted mb-0">Total Préstamos</h6>
                                    <h4 className="mb-0">{estadisticas?.estadisticas_generales?.total_prestamos || 0}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" 
                                     style={{width: '48px', height: '48px'}}>
                                    <i className="bi bi-clock text-info fs-5"></i>
                                </div>
                                <div>
                                    <h6 className="text-muted mb-0">Activos</h6>
                                    <h4 className="mb-0">{estadisticas?.estadisticas_generales?.prestamos_activos || 0}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" 
                                     style={{width: '48px', height: '48px'}}>
                                    <i className="bi bi-check-circle text-success fs-5"></i>
                                </div>
                                <div>
                                    <h6 className="text-muted mb-0">Completados</h6>
                                    <h4 className="mb-0">{estadisticas?.estadisticas_generales?.prestamos_completados || 0}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="bg-danger bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" 
                                     style={{width: '48px', height: '48px'}}>
                                    <i className="bi bi-exclamation-triangle text-danger fs-5"></i>
                                </div>
                                <div>
                                    <h6 className="text-muted mb-0">Vencidos</h6>
                                    <h4 className="mb-0">{estadisticas?.estadisticas_generales?.prestamos_vencidos || 0}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Filtros */}
            <FiltrosPrestamos onFiltrosChange={handleFiltrosChange} />

            {/* Tabla de Préstamos */}
            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Código</th>
                                    <th>Usuario</th>
                                    <th>Fecha Préstamo</th>
                                    <th>Fecha Estimada</th>
                                    <th>Items</th>
                                    <th>Estado</th>
                                    <th>Encargado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {prestamos.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4">
                                            <div className="text-muted">
                                                <i className="bi bi-clipboard-x fs-1 d-block mb-2"></i>
                                                No se encontraron préstamos
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    prestamos.map(prestamo => (
                                        <tr key={prestamo.id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <i className="bi bi-ticket-perforated text-primary me-2"></i>
                                                    <div>
                                                        <span className="fw-medium">{prestamo.codigo}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <div className="fw-medium">{prestamo.usuario_prestador_nombre}</div>
                                                    <small className="text-muted">{prestamo.usuario_prestador_email}</small>
                                                </div>
                                            </td>
                                            <td>
                                                <small>{formatearFecha(prestamo.fecha_prestamo)}</small>
                                            </td>
                                            <td>
                                                {prestamo.fecha_devolucion_estimada ? (
                                                    <small>{formatearFecha(prestamo.fecha_devolucion_estimada)}</small>
                                                ) : (
                                                    <small className="text-muted">No especificada</small>
                                                )}
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <span className="badge bg-light text-dark me-2">
                                                        {prestamo.total_items}
                                                    </span>
                                                    <div className="progress" style={{width: '60px', height: '4px'}}>
                                                        <div 
                                                            className="progress-bar bg-success" 
                                                            style={{
                                                                width: `${(prestamo.items_devueltos / prestamo.total_items) * 100}%`
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${getEstadoBadge(prestamo.estado)}`}>
                                                    {prestamo.estado.charAt(0).toUpperCase() + prestamo.estado.slice(1)}
                                                </span>
                                            </td>
                                            <td>
                                                <small className="text-muted">{prestamo.usuario_encargado_nombre}</small>
                                            </td>
                                            <td>
                                                <div className="btn-group btn-group-sm">
                                                    <button 
                                                        className="btn btn-outline-primary"
                                                        title="Ver detalles"
                                                        onClick={() => {/* TODO: Ver detalles */}}
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </button>
                                                    {(prestamo.estado === 'activo' || prestamo.estado === 'parcial') && (
                                                        <button 
                                                            className="btn btn-outline-success"
                                                            title="Devolver items"
                                                            onClick={() => {/* TODO: Devolver items */}}
                                                        >
                                                            <i className="bi bi-arrow-return-left"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {paginacion.total_pages > 1 && (
                        <div className="card-footer bg-light">
                            <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted">
                                    Mostrando {((paginacion.page - 1) * paginacion.limit) + 1} a {Math.min(paginacion.page * paginacion.limit, paginacion.total)} de {paginacion.total} préstamos
                                </small>
                                
                                <nav>
                                    <ul className="pagination pagination-sm mb-0">
                                        <li className={`page-item ${paginacion.page === 1 ? 'disabled' : ''}`}>
                                            <button 
                                                className="page-link"
                                                onClick={() => handlePaginaChange(paginacion.page - 1)}
                                                disabled={paginacion.page === 1}
                                            >
                                                Anterior
                                            </button>
                                        </li>
                                        
                                        {[...Array(paginacion.total_pages)].map((_, index) => {
                                            const numeroPage = index + 1;
                                            if (
                                                numeroPage === 1 || 
                                                numeroPage === paginacion.total_pages ||
                                                (numeroPage >= paginacion.page - 1 && numeroPage <= paginacion.page + 1)
                                            ) {
                                                return (
                                                    <li key={numeroPage} className={`page-item ${paginacion.page === numeroPage ? 'active' : ''}`}>
                                                        <button 
                                                            className="page-link"
                                                            onClick={() => handlePaginaChange(numeroPage)}
                                                        >
                                                            {numeroPage}
                                                        </button>
                                                    </li>
                                                );
                                            } else if (
                                                numeroPage === paginacion.page - 2 || 
                                                numeroPage === paginacion.page + 2
                                            ) {
                                                return (
                                                    <li key={numeroPage} className="page-item disabled">
                                                        <span className="page-link">...</span>
                                                    </li>
                                                );
                                            }
                                            return null;
                                        })}
                                        
                                        <li className={`page-item ${paginacion.page === paginacion.total_pages ? 'disabled' : ''}`}>
                                            <button 
                                                className="page-link"
                                                onClick={() => handlePaginaChange(paginacion.page + 1)}
                                                disabled={paginacion.page === paginacion.total_pages}
                                            >
                                                Siguiente
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modales */}
            <ModalPrestamo 
                mostrar={mostrarModal}
                onCerrar={() => setMostrarModal(false)}
            />
        </div>
    );
};

export default Prestamos;