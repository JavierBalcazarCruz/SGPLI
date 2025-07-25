import { useState, useEffect } from 'react';
import usePrestamos from '../../hooks/usePrestamos';

const ModalDevolucion = ({ mostrar, onCerrar, prestamo }) => {
    const { devolverItems } = usePrestamos();

    const [itemsSeleccionados, setItemsSeleccionados] = useState([]);
    const [observaciones, setObservaciones] = useState('');
    const [procesando, setProcesando] = useState(false);

    // Resetear estado cuando se abre/cierra el modal
    useEffect(() => {
        if (mostrar && prestamo) {
            // Inicializar con items pendientes
            const itemsPendientes = prestamo.items?.filter(item => item.estado === 'pendiente') || [];
            setItemsSeleccionados(
                itemsPendientes.map(item => ({
                    prestamo_item_id: item.id,
                    item_nombre: item.item_nombre,
                    cantidad: item.cantidad,
                    condicion_devolucion: 'bueno',
                    seleccionado: false
                }))
            );
            setObservaciones('');
            setProcesando(false);
        }
    }, [mostrar, prestamo]);

    const handleSeleccionarItem = (index, seleccionado) => {
        setItemsSeleccionados(prev =>
            prev.map((item, i) =>
                i === index ? { ...item, seleccionado } : item
            )
        );
    };

    const handleCondicionChange = (index, condicion) => {
        setItemsSeleccionados(prev =>
            prev.map((item, i) =>
                i === index ? { ...item, condicion_devolucion: condicion } : item
            )
        );
    };

    const handleSeleccionarTodos = (seleccionar) => {
        setItemsSeleccionados(prev =>
            prev.map(item => ({ ...item, seleccionado: seleccionar }))
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const itemsADevolver = itemsSeleccionados.filter(item => item.seleccionado);

        if (itemsADevolver.length === 0) {
            alert('Debe seleccionar al menos un item para devolver');
            return;
        }

        // Confirmar devolución
        const confirmar = window.confirm(
            `¿Está seguro de procesar la devolución de ${itemsADevolver.length} item(s)?`
        );

        if (!confirmar) return;

        setProcesando(true);

        const resultado = await devolverItems(
            prestamo.codigo,
            itemsADevolver.map(item => ({
                prestamo_item_id: item.prestamo_item_id,
                condicion_devolucion: item.condicion_devolucion
            })),
            observaciones
        );

        if (resultado.success) {
            onCerrar();
        }

        setProcesando(false);
    };

    const getCondicionBadge = (condicion) => {
        const badges = {
            'bueno': 'bg-success',
            'regular': 'bg-warning',
            'malo': 'bg-danger'
        };
        return badges[condicion] || 'bg-secondary';
    };

    const itemsSeleccionadosCount = itemsSeleccionados.filter(item => item.seleccionado).length;
    const todosSeleccionados = itemsSeleccionados.length > 0 && itemsSeleccionados.every(item => item.seleccionado);
    const algunoSeleccionado = itemsSeleccionados.some(item => item.seleccionado);

    if (!mostrar || !prestamo) return null;

    return (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header bg-success text-white">
                        <h5 className="modal-title">
                            <i className="bi bi-arrow-return-left me-2"></i>
                            Procesar Devolución
                        </h5>
                        <button 
                            type="button" 
                            className="btn-close btn-close-white" 
                            onClick={onCerrar}
                            disabled={procesando}
                        ></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {/* Información del Préstamo */}
                            <div className="card bg-light mb-4">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <h6 className="text-muted mb-1">Código del Préstamo</h6>
                                            <div className="fw-bold text-primary">
                                                <i className="bi bi-ticket-perforated me-2"></i>
                                                {prestamo.codigo}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <h6 className="text-muted mb-1">Usuario</h6>
                                            <div className="fw-medium">{prestamo.usuario_prestador_nombre}</div>
                                            <small className="text-muted">{prestamo.usuario_prestador_email}</small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Selección de items a devolver */}
                            <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="mb-0">
                                        Items Pendientes de Devolución
                                        {itemsSeleccionadosCount > 0 && (
                                            <span className="badge bg-success ms-2">
                                                {itemsSeleccionadosCount} seleccionado(s)
                                            </span>
                                        )}
                                    </h6>
                                    
                                    {itemsSeleccionados.length > 0 && (
                                        <div className="btn-group btn-group-sm">
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary"
                                                onClick={() => handleSeleccionarTodos(true)}
                                                disabled={procesando || todosSeleccionados}
                                            >
                                                Seleccionar Todos
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => handleSeleccionarTodos(false)}
                                                disabled={procesando || !algunoSeleccionado}
                                            >
                                                Deseleccionar Todos
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {itemsSeleccionados.length === 0 ? (
                                    <div className="text-center py-4 text-muted">
                                        <i className="bi bi-check-circle display-6 d-block mb-2"></i>
                                        <h6>No hay items pendientes</h6>
                                        <p>Todos los items de este préstamo ya han sido devueltos.</p>
                                    </div>
                                ) : (
                                    <div className="border rounded">
                                        {itemsSeleccionados.map((item, index) => (
                                            <div 
                                                key={item.prestamo_item_id} 
                                                className={`p-3 border-bottom ${item.seleccionado ? 'bg-success bg-opacity-10' : ''}`}
                                            >
                                                <div className="row align-items-center">
                                                    <div className="col-md-1">
                                                        <div className="form-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                checked={item.seleccionado}
                                                                onChange={(e) => handleSeleccionarItem(index, e.target.checked)}
                                                                disabled={procesando}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-5">
                                                        <div className="fw-medium">{item.item_nombre}</div>
                                                        <div className="d-flex align-items-center gap-2 mt-1">
                                                            <span className="badge bg-light text-dark">
                                                                Cantidad: {item.cantidad}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label form-label-sm">
                                                            Condición de devolución
                                                        </label>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={item.condicion_devolucion}
                                                            onChange={(e) => handleCondicionChange(index, e.target.value)}
                                                            disabled={!item.seleccionado || procesando}
                                                        >
                                                            <option value="bueno">Bueno</option>
                                                            <option value="regular">Regular</option>
                                                            <option value="malo">Malo</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Observaciones */}
                            <div className="mb-3">
                                <label className="form-label">Observaciones de la devolución</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    placeholder="Observaciones sobre el estado de los items devueltos, daños, etc..."
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                    disabled={procesando}
                                />
                            </div>

                            {/* Resumen */}
                            {itemsSeleccionadosCount > 0 && (
                                <div className="card bg-light">
                                    <div className="card-body">
                                        <h6 className="card-title mb-3">
                                            <i className="bi bi-clipboard-check me-2"></i>
                                            Resumen de Devolución
                                        </h6>
                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <div className="text-center">
                                                    <div className="h4 text-success mb-1">{itemsSeleccionadosCount}</div>
                                                    <small className="text-muted">Items a devolver</small>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="text-center">
                                                    <div className="h4 text-success mb-1">
                                                        {itemsSeleccionados.filter(item => item.seleccionado && item.condicion_devolucion === 'bueno').length}
                                                    </div>
                                                    <small className="text-muted">En buen estado</small>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="text-center">
                                                    <div className="h4 text-warning mb-1">
                                                        {itemsSeleccionados.filter(item => item.seleccionado && ['regular', 'malo'].includes(item.condicion_devolucion)).length}
                                                    </div>
                                                    <small className="text-muted">Con daños</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={onCerrar}
                                disabled={procesando}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-success"
                                disabled={procesando || itemsSeleccionadosCount === 0}
                            >
                                {procesando ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-circle me-2"></i>
                                        Confirmar Devolución ({itemsSeleccionadosCount})
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ModalDevolucion;