import { useState, useEffect } from 'react';
import useItems from '../hooks/useItems';
import useAuth from '../hooks/useAuth';
import ItemModal from '../components/ItemModal';
import CategoriaModal from '../components/CategoriaModal';

const Items = () => {
    const { auth } = useAuth();
    const { 
        items, 
        categorias, 
        cargando, 
        obtenerItems, 
        eliminarItem 
    } = useItems();

    const [filtros, setFiltros] = useState({
        categoria: '',
        estado: '',
        busqueda: ''
    });

    const [showItemModal, setShowItemModal] = useState(false);
    const [showCategoriaModal, setShowCategoriaModal] = useState(false);
    const [itemSeleccionado, setItemSeleccionado] = useState(null);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const [itemsFiltrados, setItemsFiltrados] = useState([]);

    // Filtrar items cuando cambien los filtros o los items
    useEffect(() => {
        let resultado = [...items];

        // Filtro por búsqueda (nombre o código)
        if (filtros.busqueda) {
            const busqueda = filtros.busqueda.toLowerCase();
            resultado = resultado.filter(item => 
                item.nombre.toLowerCase().includes(busqueda) ||
                (item.codigo_inventario && item.codigo_inventario.toLowerCase().includes(busqueda))
            );
        }

        // Filtro por categoría
        if (filtros.categoria) {
            resultado = resultado.filter(item => 
                item.categoria_id === parseInt(filtros.categoria)
            );
        }

        // Filtro por estado
        if (filtros.estado) {
            resultado = resultado.filter(item => item.estado === filtros.estado);
        }

        setItemsFiltrados(resultado);
    }, [items, filtros]);

    const handleFiltroChange = (campo, valor) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    const limpiarFiltros = () => {
        setFiltros({
            categoria: '',
            estado: '',
            busqueda: ''
        });
    };

    const abrirModalItem = (item = null) => {
        setItemSeleccionado(item);
        setShowItemModal(true);
    };

    const cerrarModalItem = () => {
        setItemSeleccionado(null);
        setShowItemModal(false);
    };

    const abrirModalCategoria = (categoria = null) => {
        setCategoriaSeleccionada(categoria);
        setShowCategoriaModal(true);
    };

    const cerrarModalCategoria = () => {
        setCategoriaSeleccionada(null);
        setShowCategoriaModal(false);
    };

    const handleEliminarItem = async (id) => {
        await eliminarItem(id);
    };

    const getBadgeEstado = (estado) => {
        const badges = {
            'disponible': 'bg-success',
            'mantenimiento': 'bg-warning',
            'dado_de_baja': 'bg-danger'
        };
        return badges[estado] || 'bg-secondary';
    };

    const getBadgeDisponibilidad = (disponible, total) => {
        const porcentaje = (disponible / total) * 100;
        if (porcentaje === 0) return 'bg-danger';
        if (porcentaje < 30) return 'bg-warning';
        return 'bg-success';
    };

    if (cargando) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando items...</span>
                    </div>
                    <p className="mt-3 text-muted">Cargando inventario...</p>
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
                            <h2 className="fw-bold text-dark mb-1">
                                <i className="bi bi-tools me-2"></i>
                                Gestión de Inventario
                            </h2>
                            <p className="text-muted mb-0">
                                Administra los items y categorías del laboratorio
                            </p>
                        </div>
                        <div className="d-flex gap-2">
                            {auth.tipo === 'admin' && (
                                <>
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={() => abrirModalCategoria()}
                                    >
                                        <i className="bi bi-tag me-2"></i>
                                        Nueva Categoría
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => abrirModalItem()}
                                    >
                                        <i className="bi bi-plus-circle me-2"></i>
                                        Nuevo Item
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label fw-semibold">
                                <i className="bi bi-search me-1"></i>
                                Buscar
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar por nombre o código..."
                                value={filtros.busqueda}
                                onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-semibold">
                                <i className="bi bi-tag me-1"></i>
                                Categoría
                            </label>
                            <select
                                className="form-select"
                                value={filtros.categoria}
                                onChange={(e) => handleFiltroChange('categoria', e.target.value)}
                            >
                                <option value="">Todas las categorías</option>
                                {categorias.map(categoria => (
                                    <option key={categoria.id} value={categoria.id}>
                                        {categoria.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-semibold">
                                <i className="bi bi-gear me-1"></i>
                                Estado
                            </label>
                            <select
                                className="form-select"
                                value={filtros.estado}
                                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                            >
                                <option value="">Todos los estados</option>
                                <option value="disponible">Disponible</option>
                                <option value="mantenimiento">Mantenimiento</option>
                                <option value="dado_de_baja">Dado de baja</option>
                            </select>
                        </div>
                        <div className="col-md-2 d-flex align-items-end">
                            <button
                                className="btn btn-outline-secondary w-100"
                                onClick={limpiarFiltros}
                            >
                                <i className="bi bi-x-circle me-1"></i>
                                Limpiar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Estadísticas rápidas */}
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <div className="card bg-primary text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title opacity-75">Total Items</h6>
                                    <h3 className="mb-0">{items.length}</h3>
                                </div>
                                <i className="bi bi-tools" style={{fontSize: '2rem', opacity: 0.7}}></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-success text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title opacity-75">Disponibles</h6>
                                    <h3 className="mb-0">
                                        {items.filter(item => item.estado === 'disponible').length}
                                    </h3>
                                </div>
                                <i className="bi bi-check-circle" style={{fontSize: '2rem', opacity: 0.7}}></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-warning text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title opacity-75">Mantenimiento</h6>
                                    <h3 className="mb-0">
                                        {items.filter(item => item.estado === 'mantenimiento').length}
                                    </h3>
                                </div>
                                <i className="bi bi-wrench" style={{fontSize: '2rem', opacity: 0.7}}></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-info text-white">
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="card-title opacity-75">Categorías</h6>
                                    <h3 className="mb-0">{categorias.length}</h3>
                                </div>
                                <i className="bi bi-tags" style={{fontSize: '2rem', opacity: 0.7}}></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla de Items */}
            <div className="card shadow-sm">
                <div className="card-header bg-light">
                    <h5 className="mb-0">
                        <i className="bi bi-list me-2"></i>
                        Items del Inventario
                        <span className="badge bg-primary ms-2">{itemsFiltrados.length}</span>
                    </h5>
                </div>
                <div className="card-body p-0">
                    {itemsFiltrados.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-inbox display-1 text-muted"></i>
                            <h4 className="text-muted mt-3">No se encontraron items</h4>
                            <p className="text-muted">
                                {items.length === 0 
                                    ? 'Comienza agregando tu primer item al inventario'
                                    : 'Intenta ajustar los filtros de búsqueda'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th>Item</th>
                                        <th>Categoría</th>
                                        <th>Código</th>
                                        <th>Disponibilidad</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itemsFiltrados.map(item => (
                                        <tr key={item.id}>
                                            <td>
                                                <div>
                                                    <h6 className="mb-0">{item.nombre}</h6>
                                                    {item.descripcion && (
                                                        <small className="text-muted">{item.descripcion}</small>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge bg-light text-dark">
                                                    {item.categoria_nombre || 'Sin categoría'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="font-monospace">
                                                    {item.codigo_inventario || '-'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <span className="me-2">
                                                        {item.cantidad_disponible}/{item.cantidad_total}
                                                    </span>
                                                    <span className={`badge ${getBadgeDisponibilidad(item.cantidad_disponible, item.cantidad_total)}`}>
                                                        {Math.round((item.cantidad_disponible / item.cantidad_total) * 100)}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${getBadgeEstado(item.estado)}`}>
                                                    {item.estado}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="btn-group btn-group-sm">
                                                    <button
                                                        className="btn btn-outline-primary"
                                                        onClick={() => abrirModalItem(item)}
                                                        title="Ver/Editar"
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </button>
                                                    {auth.tipo === 'admin' && (
                                                        <button
                                                            className="btn btn-outline-danger"
                                                            onClick={() => handleEliminarItem(item.id)}
                                                            title="Dar de baja"
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modales */}
            <ItemModal
                show={showItemModal}
                onHide={cerrarModalItem}
                item={itemSeleccionado}
                categorias={categorias}
            />

            <CategoriaModal
                show={showCategoriaModal}
                onHide={cerrarModalCategoria}
                categoria={categoriaSeleccionada}
            />
        </div>
    );
};

export default Items;