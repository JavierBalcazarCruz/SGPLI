import { useState } from 'react';
import usePrestamos from '../hooks/usePrestamos';
import ModalDevolucion from '../components/prestamos/ModalDevolucion';

const Devoluciones = () => {
    const { 
        buscarPrestamoPorCodigo, 
        prestamoActual, 
        limpiarPrestamoActual,
        cargando 
    } = usePrestamos();

    const [codigoBusqueda, setCodigoBusqueda] = useState('');
    const [buscando, setBuscando] = useState(false);
    const [mostrarModalDevolucion, setMostrarModalDevolucion] = useState(false);

    const handleBuscarPrestamo = async (e) => {
        e.preventDefault();
        
        if (!codigoBusqueda.trim()) {
            alert('Ingrese un código de préstamo');
            return;
        }

        setBuscando(true);
        const resultado = await buscarPrestamoPorCodigo(codigoBusqueda.trim());
        setBuscando(false);

        if (resultado.success) {
            // El préstamo se guardó en prestamoActual automáticamente
        }
    };

    const handleLimpiarBusqueda = () => {
        setCodigoBusqueda('');
        limpiarPrestamoActual();
    };

    const handleIniciarDevolucion = () => {
        if (!prestamoActual) return;
        setMostrarModalDevolucion(true);
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

    const getEstadoBadge = (estado) => {
        const badges = {
            'activo': 'bg-primary',
            'parcial': 'bg-warning',
            'completado': 'bg-success',
            'vencido': 'bg-danger'
        };
        return badges[estado] || 'bg-secondary';
    };

    const getCondicionBadge = (condicion) => {
        const badges = {
            'bueno': 'bg-success',
            'regular': 'bg-warning',
            'malo': 'bg-danger'
        };
        return badges[condicion] || 'bg-secondary';
    };

    const getEstadoItemBadge = (estado) => {
        const badges = {
            'pendiente': 'bg-warning',
            'entregado': 'bg-success',
            'perdido': 'bg-danger'
        };
        return badges[estado] || 'bg-secondary';
    };

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="mb-1">
                                <i className="bi bi-arrow-return-left text-success me-3"></i>
                                Devolución de Items
                            </h2>
                            <p className="text-muted mb-0">
                                Busca un préstamo por su código para procesar la devolución
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Buscador de Préstamo */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-primary text-white">
                    <h6 className="mb-0">
                        <i className="bi bi-search me-2"></i>
                        Buscar Préstamo por Código
                    </h6>
                </div>
                <div className="card-body">
                    <form onSubmit={handleBuscarPrestamo} className="row g-3 align-items-end">
                        <div className="col-md-8">
                            <label className="form-label">Código del Voucher</label>
                            <input
                                type="text"
                                className="form-control form-control-lg"
                                placeholder="Ej: PRES-20241223-A4B2"
                                value={codigoBusqueda}
                                onChange={(e) => setCodigoBusqueda(e.target.value.toUpperCase())}
                                disabled={buscando}
                            />
                            <small className="text-muted">
                                Ingrese el código del voucher que se entregó al crear el préstamo
                            </small>
                        </div>
                        <div className="col-md-4">
                            <div className="d-flex gap-2">
                                <button 
                                    type="submit" 
                                    className="btn btn-primary btn-lg flex-grow-1"
                                    disabled={buscando || !codigoBusqueda.trim()}
                                >
                                    {buscando ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Buscando...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-search me-2"></i>
                                            Buscar
                                        </>
                                    )}
                                </button>
                                {prestamoActual && (
                                    <button 
                                        type="button" 
                                        className="btn btn-outline-secondary"
                                        onClick={handleLimpiarBusqueda}
                                        title="Limpiar búsqueda"
                                    >
                                        <i className="bi bi-x-lg"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Información del Préstamo Encontrado */}
            {prestamoActual && (
                <div className="card shadow-sm">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="mb-1">
                                <i className="bi bi-ticket-perforated text-primary me-2"></i>
                                Préstamo: {prestamoActual.codigo}
                            </h5>
                            <div className="d-flex align-items-center gap-3">
                                <span className={`badge ${getEstadoBadge(prestamoActual.estado)}`}>
                                    {prestamoActual.estado.charAt(0).toUpperCase() + prestamoActual.estado.slice(1)}
                                </span>
                                <small className="text-muted">
                                    Creado el {formatearFecha(prestamoActual.fecha_prestamo)}
                                </small>
                            </div>
                        </div>
                        {(prestamoActual.estado === 'activo' || prestamoActual.estado === 'parcial') && (
                            <button 
                                className="btn btn-success"
                                onClick={handleIniciarDevolucion}
                            >
                                <i className="bi bi-arrow-return-left me-2"></i>
                                Procesar Devolución
                            </button>
                        )}
                    </div>

                    <div className="card-body">
                        {/* Información del Usuario */}
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <h6 className="text-muted mb-2">Usuario Prestador</h6>
                                <div className="d-flex align-items-center">
                                    <i className="bi bi-person-circle text-primary fs-4 me-3"></i>
                                    <div>
                                        <div className="fw-medium">{prestamoActual.usuario_prestador_nombre}</div>
                                        <small className="text-muted">{prestamoActual.usuario_prestador_email}</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <h6 className="text-muted mb-2">Información del Préstamo</h6>
                                <div className="row g-2">
                                    <div className="col-6">
                                        <small className="text-muted d-block">Fecha Préstamo:</small>
                                        <span className="fw-medium">{formatearFecha(prestamoActual.fecha_prestamo)}</span>
                                    </div>
                                    <div className="col-6">
                                        <small className="text-muted d-block">Fecha Estimada:</small>
                                        <span className="fw-medium">
                                            {prestamoActual.fecha_devolucion_estimada 
                                                ? formatearFecha(prestamoActual.fecha_devolucion_estimada)
                                                : 'No especificada'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items del Préstamo */}
                        <div className="mb-3">
                            <h6 className="text-muted mb-3">
                                Items del Préstamo 
                                <span className="badge bg-light text-dark ms-2">
                                    {prestamoActual.items?.length || 0} item(s)
                                </span>
                            </h6>
                            
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Item</th>
                                            <th>Cantidad</th>
                                            <th>Condición Préstamo</th>
                                            <th>Estado</th>
                                            <th>Fecha Devolución</th>
                                            <th>Condición Devolución</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {prestamoActual.items?.map(item => (
                                            <tr key={item.id} className={item.estado === 'entregado' ? 'table-success' : ''}>
                                                <td>
                                                    <div>
                                                        <div className="fw-medium">{item.item_nombre}</div>
                                                        {item.codigo_inventario && (
                                                            <small className="text-muted">
                                                                Código: {item.codigo_inventario}
                                                            </small>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-light text-dark">
                                                        {item.cantidad}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${getCondicionBadge(item.condicion_prestamo)}`}>
                                                        {item.condicion_prestamo?.charAt(0).toUpperCase() + item.condicion_prestamo?.slice(1)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${getEstadoItemBadge(item.estado)}`}>
                                                        <i className={`bi ${
                                                            item.estado === 'entregado' ? 'bi-check-circle' : 
                                                            item.estado === 'pendiente' ? 'bi-clock' : 'bi-x-circle'
                                                        } me-1`}></i>
                                                        {item.estado === 'entregado' ? 'Devuelto' : 
                                                         item.estado === 'pendiente' ? 'Pendiente' : 'Perdido'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {item.fecha_devolucion ? (
                                                        <small>{formatearFecha(item.fecha_devolucion)}</small>
                                                    ) : (
                                                        <small className="text-muted">-</small>
                                                    )}
                                                </td>
                                                <td>
                                                    {item.condicion_devolucion ? (
                                                        <span className={`badge ${getCondicionBadge(item.condicion_devolucion)}`}>
                                                            {item.condicion_devolucion.charAt(0).toUpperCase() + item.condicion_devolucion.slice(1)}
                                                        </span>
                                                    ) : (
                                                        <small className="text-muted">-</small>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Progreso de Devolución */}
                        <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="text-muted mb-0">Progreso de Devolución</h6>
                                <small className="text-muted">
                                    {prestamoActual.items?.filter(item => item.estado === 'entregado').length || 0} de {prestamoActual.items?.length || 0} devueltos
                                </small>
                            </div>
                            <div className="progress" style={{height: '8px'}}>
                                <div 
                                    className="progress-bar bg-success" 
                                    style={{
                                        width: `${prestamoActual.items?.length ? 
                                            ((prestamoActual.items.filter(item => item.estado === 'entregado').length / prestamoActual.items.length) * 100) : 0
                                        }%`
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* Observaciones */}
                        {prestamoActual.observaciones && (
                            <div className="mb-3">
                                <h6 className="text-muted mb-2">Observaciones</h6>
                                <div className="p-3 bg-light rounded">
                                    <pre className="mb-0" style={{whiteSpace: 'pre-wrap', fontFamily: 'inherit'}}>
                                        {prestamoActual.observaciones}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* Información del Encargado */}
                        <div className="mt-4 pt-3 border-top">
                            <small className="text-muted">
                                <i className="bi bi-person-badge me-1"></i>
                                Préstamo autorizado por: <strong>{prestamoActual.usuario_encargado_nombre}</strong>
                            </small>
                        </div>
                    </div>

                    {/* Footer con acciones adicionales */}
                    {prestamoActual.estado === 'completado' && (
                        <div className="card-footer bg-success bg-opacity-10">
                            <div className="d-flex align-items-center text-success">
                                <i className="bi bi-check-circle-fill me-2"></i>
                                <strong>Préstamo completado - Todos los items han sido devueltos</strong>
                            </div>
                        </div>
                    )}

                    {prestamoActual.estado === 'vencido' && (
                        <div className="card-footer bg-danger bg-opacity-10">
                            <div className="d-flex align-items-center text-danger">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                <strong>Préstamo vencido - Se requiere acción inmediata</strong>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Mensaje cuando no hay préstamo */}
            {!prestamoActual && !buscando && (
                <div className="card shadow-sm">
                    <div className="card-body text-center py-5">
                        <i className="bi bi-search display-1 text-muted mb-3"></i>
                        <h5 className="text-muted">Busca un préstamo para comenzar</h5>
                        <p className="text-muted">
                            Ingresa el código del voucher en el buscador de arriba para ver los detalles del préstamo
                            y procesar la devolución de items.
                        </p>
                    </div>
                </div>
            )}

            {/* Modal de Devolución */}
            <ModalDevolucion 
                mostrar={mostrarModalDevolucion}
                onCerrar={() => setMostrarModalDevolucion(false)}
                prestamo={prestamoActual}
            />
        </div>
    );
};

export default Devoluciones;