import { useState, useEffect } from 'react';
import usePrestamos from '../../hooks/usePrestamos';
import useItems from '../../hooks/useItems';

const ModalPrestamo = ({ mostrar, onCerrar }) => {
    const { crearPrestamo, usuarios, obtenerUsuarios } = usePrestamos();
    const { items, obtenerItems } = useItems();

    const [formData, setFormData] = useState({
        usuario_prestador_id: '',
        fecha_devolucion_estimada: '',
        observaciones: '',
        items: []
    });

    const [busquedaUsuario, setBusquedaUsuario] = useState('');
    const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
    const [mostrarSugerenciasUsuario, setMostrarSugerenciasUsuario] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

    const [busquedaItem, setBusquedaItem] = useState('');
    const [itemsFiltrados, setItemsFiltrados] = useState([]);
    const [mostrarSugerenciasItem, setMostrarSugerenciasItem] = useState(false);

    const [enviando, setEnviando] = useState(false);

    // Cargar datos cuando se abre el modal
    useEffect(() => {
        if (mostrar) {
            obtenerUsuarios();
            obtenerItems({ disponibles_solo: 'true' });
            resetForm();
        }
    }, [mostrar]);

    // Filtrar usuarios en tiempo real
    useEffect(() => {
        if (busquedaUsuario.length >= 2) {
            const filtrados = usuarios.filter(usuario =>
                usuario.nombre.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
                usuario.email.toLowerCase().includes(busquedaUsuario.toLowerCase())
            );
            setUsuariosFiltrados(filtrados.slice(0, 5)); // Máximo 5 sugerencias
            setMostrarSugerenciasUsuario(true);
        } else {
            setUsuariosFiltrados([]);
            setMostrarSugerenciasUsuario(false);
        }
    }, [busquedaUsuario, usuarios]);

    // Filtrar items disponibles
    useEffect(() => {
        if (busquedaItem.length >= 2) {
            const filtrados = items.filter(item =>
                item.estado === 'disponible' &&
                item.cantidad_disponible > 0 &&
                (item.nombre.toLowerCase().includes(busquedaItem.toLowerCase()) ||
                 (item.codigo_inventario && item.codigo_inventario.toLowerCase().includes(busquedaItem.toLowerCase())))
            );
            setItemsFiltrados(filtrados.slice(0, 8));
            setMostrarSugerenciasItem(true);
        } else {
            setItemsFiltrados([]);
            setMostrarSugerenciasItem(false);
        }
    }, [busquedaItem, items]);

    const resetForm = () => {
        setFormData({
            usuario_prestador_id: '',
            fecha_devolucion_estimada: '',
            observaciones: '',
            items: []
        });
        setBusquedaUsuario('');
        setUsuarioSeleccionado(null);
        setBusquedaItem('');
        setEnviando(false);
    };

    const handleUsuarioSelect = (usuario) => {
        setUsuarioSeleccionado(usuario);
        setBusquedaUsuario(usuario.nombre);
        setFormData(prev => ({ ...prev, usuario_prestador_id: usuario.id }));
        setMostrarSugerenciasUsuario(false);
    };

    const handleItemSelect = (item) => {
        // Verificar si el item ya está agregado
        const itemExistente = formData.items.find(i => i.item_id === item.id);
        if (itemExistente) {
            alert('Este item ya está agregado al préstamo');
            return;
        }

        const nuevoItem = {
            item_id: item.id,
            nombre: item.nombre,
            codigo_inventario: item.codigo_inventario,
            cantidad_disponible: item.cantidad_disponible,
            cantidad: 1,
            condicion_prestamo: 'bueno'
        };

        setFormData(prev => ({
            ...prev,
            items: [...prev.items, nuevoItem]
        }));

        setBusquedaItem('');
        setMostrarSugerenciasItem(false);
    };

    const handleItemCantidadChange = (index, nuevaCantidad) => {
        const cantidad = parseInt(nuevaCantidad) || 1;
        const item = formData.items[index];
        
        if (cantidad > item.cantidad_disponible) {
            alert(`Solo hay ${item.cantidad_disponible} unidades disponibles`);
            return;
        }

        setFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) => 
                i === index ? { ...item, cantidad } : item
            )
        }));
    };

    const handleItemCondicionChange = (index, condicion) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) => 
                i === index ? { ...item, condicion_prestamo: condicion } : item
            )
        }));
    };

    const handleRemoveItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.usuario_prestador_id) {
            alert('Debe seleccionar un usuario');
            return;
        }

        if (formData.items.length === 0) {
            alert('Debe agregar al menos un item al préstamo');
            return;
        }

        setEnviando(true);

        // Preparar datos para envío
        const prestamoData = {
            usuario_prestador_id: formData.usuario_prestador_id,
            fecha_devolucion_estimada: formData.fecha_devolucion_estimada || null,
            observaciones: formData.observaciones || null,
            items: formData.items.map(item => ({
                item_id: item.item_id,
                cantidad: item.cantidad,
                condicion_prestamo: item.condicion_prestamo
            }))
        };

        const resultado = await crearPrestamo(prestamoData);
        
        if (resultado.success) {
            onCerrar();
            resetForm();
        }
        
        setEnviando(false);
    };

    const getTotalItems = () => {
        return formData.items.reduce((total, item) => total + item.cantidad, 0);
    };

    if (!mostrar) return null;

    return (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-xl">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">
                            <i className="bi bi-plus-circle me-2"></i>
                            Nuevo Préstamo
                        </h5>
                        <button 
                            type="button" 
                            className="btn-close btn-close-white" 
                            onClick={onCerrar}
                            disabled={enviando}
                        ></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="row">
                                {/* Información del Usuario */}
                                <div className="col-md-6">
                                    <div className="card h-100">
                                        <div className="card-header bg-light">
                                            <h6 className="mb-0">
                                                <i className="bi bi-person me-2"></i>
                                                Información del Usuario
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Usuario que solicita <span className="text-danger">*</span>
                                                </label>
                                                <div className="position-relative">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Buscar usuario por nombre o email..."
                                                        value={busquedaUsuario}
                                                        onChange={(e) => setBusquedaUsuario(e.target.value)}
                                                        onFocus={() => setMostrarSugerenciasUsuario(busquedaUsuario.length >= 2)}
                                                        disabled={enviando}
                                                    />
                                                    
                                                    {mostrarSugerenciasUsuario && usuariosFiltrados.length > 0 && (
                                                        <div className="position-absolute w-100 bg-white border rounded shadow-sm mt-1" style={{zIndex: 1050}}>
                                                            {usuariosFiltrados.map(usuario => (
                                                                <div
                                                                    key={usuario.id}
                                                                    className="p-2 border-bottom cursor-pointer hover-bg-light"
                                                                    onClick={() => handleUsuarioSelect(usuario)}
                                                                    style={{cursor: 'pointer'}}
                                                                    onMouseEnter={(e) => e.target.classList.add('bg-light')}
                                                                    onMouseLeave={(e) => e.target.classList.remove('bg-light')}
                                                                >
                                                                    <div className="fw-medium">{usuario.nombre}</div>
                                                                    <small className="text-muted">{usuario.email}</small>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {usuarioSeleccionado && (
                                                    <div className="mt-2 p-2 bg-light rounded">
                                                        <small className="text-muted">Usuario seleccionado:</small>
                                                        <div className="fw-medium">{usuarioSeleccionado.nombre}</div>
                                                        <small className="text-muted">{usuarioSeleccionado.email}</small>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Fecha estimada de devolución</label>
                                                <input
                                                    type="datetime-local"
                                                    className="form-control"
                                                    value={formData.fecha_devolucion_estimada}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        fecha_devolucion_estimada: e.target.value
                                                    }))}
                                                    min={new Date().toISOString().slice(0, 16)}
                                                    disabled={enviando}
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Observaciones</label>
                                                <textarea
                                                    className="form-control"
                                                    rows="3"
                                                    placeholder="Observaciones adicionales sobre el préstamo..."
                                                    value={formData.observaciones}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        observaciones: e.target.value
                                                    }))}
                                                    disabled={enviando}
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Items del Préstamo */}
                                <div className="col-md-6">
                                    <div className="card h-100">
                                        <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                            <h6 className="mb-0">
                                                <i className="bi bi-tools me-2"></i>
                                                Items del Préstamo
                                            </h6>
                                            <span className="badge bg-primary">
                                                {getTotalItems()} item(s)
                                            </span>
                                        </div>
                                        <div className="card-body">
                                            {/* Buscador de Items */}
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Agregar item <span className="text-danger">*</span>
                                                </label>
                                                <div className="position-relative">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Buscar por nombre o código..."
                                                        value={busquedaItem}
                                                        onChange={(e) => setBusquedaItem(e.target.value)}
                                                        onFocus={() => setMostrarSugerenciasItem(busquedaItem.length >= 2)}
                                                        disabled={enviando}
                                                    />
                                                    
                                                    {mostrarSugerenciasItem && itemsFiltrados.length > 0 && (
                                                        <div className="position-absolute w-100 bg-white border rounded shadow-sm mt-1" style={{zIndex: 1049, maxHeight: '200px', overflowY: 'auto'}}>
                                                            {itemsFiltrados.map(item => (
                                                                <div
                                                                    key={item.id}
                                                                    className="p-2 border-bottom cursor-pointer"
                                                                    onClick={() => handleItemSelect(item)}
                                                                    style={{cursor: 'pointer'}}
                                                                    onMouseEnter={(e) => e.target.classList.add('bg-light')}
                                                                    onMouseLeave={(e) => e.target.classList.remove('bg-light')}
                                                                >
                                                                    <div className="d-flex justify-content-between">
                                                                        <div>
                                                                            <div className="fw-medium">{item.nombre}</div>
                                                                            {item.codigo_inventario && (
                                                                                <small className="text-muted">
                                                                                    Código: {item.codigo_inventario}
                                                                                </small>
                                                                            )}
                                                                        </div>
                                                                        <small className="text-success">
                                                                            {item.cantidad_disponible} disponible(s)
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Lista de Items Agregados */}
                                            <div className="border rounded" style={{maxHeight: '300px', overflowY: 'auto'}}>
                                                {formData.items.length === 0 ? (
                                                    <div className="text-center py-4 text-muted">
                                                        <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                                                        No hay items agregados
                                                    </div>
                                                ) : (
                                                    formData.items.map((item, index) => (
                                                        <div key={index} className="p-2 border-bottom">
                                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                                <div className="flex-grow-1">
                                                                    <div className="fw-medium">{item.nombre}</div>
                                                                    {item.codigo_inventario && (
                                                                        <small className="text-muted">
                                                                            {item.codigo_inventario}
                                                                        </small>
                                                                    )}
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => handleRemoveItem(index)}
                                                                    disabled={enviando}
                                                                    title="Remover item"
                                                                >
                                                                    <i className="bi bi-x"></i>
                                                                </button>
                                                            </div>
                                                            
                                                            <div className="row g-2">
                                                                <div className="col-6">
                                                                    <label className="form-label form-label-sm">Cantidad</label>
                                                                    <input
                                                                        type="number"
                                                                        className="form-control form-control-sm"
                                                                        min="1"
                                                                        max={item.cantidad_disponible}
                                                                        value={item.cantidad}
                                                                        onChange={(e) => handleItemCantidadChange(index, e.target.value)}
                                                                        disabled={enviando}
                                                                    />
                                                                    <small className="text-muted">
                                                                        Máx: {item.cantidad_disponible}
                                                                    </small>
                                                                </div>
                                                                <div className="col-6">
                                                                    <label className="form-label form-label-sm">Condición</label>
                                                                    <select
                                                                        className="form-select form-select-sm"
                                                                        value={item.condicion_prestamo}
                                                                        onChange={(e) => handleItemCondicionChange(index, e.target.value)}
                                                                        disabled={enviando}
                                                                    >
                                                                        <option value="bueno">Bueno</option>
                                                                        <option value="regular">Regular</option>
                                                                        <option value="malo">Malo</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={onCerrar}
                                disabled={enviando}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={enviando || !formData.usuario_prestador_id || formData.items.length === 0}
                            >
                                {enviando ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Creando...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-circle me-2"></i>
                                        Crear Préstamo
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

export default ModalPrestamo;