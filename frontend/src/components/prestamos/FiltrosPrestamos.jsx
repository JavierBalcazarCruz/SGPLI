import { useState, useEffect } from 'react';
import usePrestamos from '../../hooks/usePrestamos';

const FiltrosPrestamos = ({ onFiltrosChange }) => {
    const { usuarios, obtenerUsuarios } = usePrestamos();
    
    const [filtros, setFiltros] = useState({
        estado: '',
        usuario_prestador_id: '',
        fecha_desde: '',
        fecha_hasta: ''
    });

    const [mostrarFiltros, setMostrarFiltros] = useState(false);

    useEffect(() => {
        obtenerUsuarios();
    }, []);

    const handleFiltroChange = (campo, valor) => {
        const nuevosFiltros = { ...filtros, [campo]: valor };
        setFiltros(nuevosFiltros);
        
        // Filtrar valores vacíos
        const filtrosLimpios = Object.entries(nuevosFiltros).reduce((acc, [key, value]) => {
            if (value && value !== '') {
                acc[key] = value;
            }
            return acc;
        }, {});
        
        onFiltrosChange(filtrosLimpios);
    };

    const limpiarFiltros = () => {
        const filtrosVacios = {
            estado: '',
            usuario_prestador_id: '',
            fecha_desde: '',
            fecha_hasta: ''
        };
        setFiltros(filtrosVacios);
        onFiltrosChange({});
    };

    const tienesFiltrosActivos = () => {
        return Object.values(filtros).some(valor => valor && valor !== '');
    };

    const estados = [
        { value: 'activo', label: 'Activo', color: 'primary' },
        { value: 'parcial', label: 'Parcial', color: 'warning' },
        { value: 'completado', label: 'Completado', color: 'success' },
        { value: 'vencido', label: 'Vencido', color: 'danger' }
    ];

    return (
        <div className="card shadow-sm mb-4">
            <div className="card-header bg-light">
                <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">
                        <i className="bi bi-funnel me-2"></i>
                        Filtros de Búsqueda
                        {tienesFiltrosActivos() && (
                            <span className="badge bg-primary ms-2">
                                {Object.values(filtros).filter(v => v && v !== '').length}
                            </span>
                        )}
                    </h6>
                    <div className="d-flex gap-2">
                        {tienesFiltrosActivos() && (
                            <button 
                                className="btn btn-sm btn-outline-secondary"
                                onClick={limpiarFiltros}
                            >
                                <i className="bi bi-x-circle me-1"></i>
                                Limpiar
                            </button>
                        )}
                        <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setMostrarFiltros(!mostrarFiltros)}
                        >
                            <i className={`bi ${mostrarFiltros ? 'bi-chevron-up' : 'bi-chevron-down'} me-1`}></i>
                            {mostrarFiltros ? 'Ocultar' : 'Mostrar'} Filtros
                        </button>
                    </div>
                </div>
            </div>

            {mostrarFiltros && (
                <div className="card-body">
                    <div className="row g-3">
                        {/* Filtro por Estado */}
                        <div className="col-md-3">
                            <label className="form-label">Estado del Préstamo</label>
                            <select 
                                className="form-select"
                                value={filtros.estado}
                                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                            >
                                <option value="">Todos los estados</option>
                                {estados.map(estado => (
                                    <option key={estado.value} value={estado.value}>
                                        {estado.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro por Usuario */}
                        <div className="col-md-3">
                            <label className="form-label">Usuario Prestador</label>
                            <select 
                                className="form-select"
                                value={filtros.usuario_prestador_id}
                                onChange={(e) => handleFiltroChange('usuario_prestador_id', e.target.value)}
                            >
                                <option value="">Todos los usuarios</option>
                                {usuarios.map(usuario => (
                                    <option key={usuario.id} value={usuario.id}>
                                        {usuario.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro Fecha Desde */}
                        <div className="col-md-3">
                            <label className="form-label">Fecha Desde</label>
                            <input 
                                type="date"
                                className="form-control"
                                value={filtros.fecha_desde}
                                onChange={(e) => handleFiltroChange('fecha_desde', e.target.value)}
                                max={filtros.fecha_hasta || new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        {/* Filtro Fecha Hasta */}
                        <div className="col-md-3">
                            <label className="form-label">Fecha Hasta</label>
                            <input 
                                type="date"
                                className="form-control"
                                value={filtros.fecha_hasta}
                                onChange={(e) => handleFiltroChange('fecha_hasta', e.target.value)}
                                min={filtros.fecha_desde}
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>

                    {/* Estados Quick Filters */}
                    <div className="mt-3 pt-3 border-top">
                        <small className="text-muted d-block mb-2">Filtros rápidos por estado:</small>
                        <div className="d-flex flex-wrap gap-2">
                            <button
                                className={`btn btn-sm ${!filtros.estado ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => handleFiltroChange('estado', '')}
                            >
                                Todos
                            </button>
                            {estados.map(estado => (
                                <button
                                    key={estado.value}
                                    className={`btn btn-sm ${
                                        filtros.estado === estado.value 
                                            ? `btn-${estado.color}` 
                                            : `btn-outline-${estado.color}`
                                    }`}
                                    onClick={() => handleFiltroChange('estado', estado.value)}
                                >
                                    {estado.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FiltrosPrestamos;