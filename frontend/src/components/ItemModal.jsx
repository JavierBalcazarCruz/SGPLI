import { useState, useEffect } from 'react';
import useItems from '../hooks/useItems';
import useAuth from '../hooks/useAuth';

const ItemModal = ({ show, onHide, item, categorias }) => {
    const { auth } = useAuth();
    const { crearItem, actualizarItem } = useItems();
    
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        cantidad_total: '',
        categoria_id: '',
        codigo_inventario: '',
        estado: 'disponible'
    });
    
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});

    const esEdicion = Boolean(item);
    const puedeEditar = auth.tipo === 'admin';

    // Cargar datos del item cuando se abre el modal
    useEffect(() => {
        if (show && item) {
            setFormData({
                nombre: item.nombre || '',
                descripcion: item.descripcion || '',
                cantidad_total: item.cantidad_total || '',
                categoria_id: item.categoria_id || '',
                codigo_inventario: item.codigo_inventario || '',
                estado: item.estado || 'disponible'
            });
        } else if (show && !item) {
            // Limpiar formulario para nuevo item
            setFormData({
                nombre: '',
                descripcion: '',
                cantidad_total: '',
                categoria_id: '',
                codigo_inventario: '',
                estado: 'disponible'
            });
        }
        setErrores({});
    }, [show, item]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Limpiar error del campo
        if (errores[name]) {
            setErrores(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!formData.nombre.trim()) {
            nuevosErrores.nombre = 'El nombre es obligatorio';
        }

        if (!formData.cantidad_total || formData.cantidad_total < 0) {
            nuevosErrores.cantidad_total = 'La cantidad debe ser mayor o igual a 0';
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validarFormulario()) return;

        setGuardando(true);

        try {
            const datos = {
                ...formData,
                cantidad_total: parseInt(formData.cantidad_total),
                categoria_id: formData.categoria_id || null
            };

            let resultado;
            if (esEdicion) {
                resultado = await actualizarItem(item.id, datos);
            } else {
                resultado = await crearItem(datos);
            }

            if (resultado.success) {
                onHide();
            }
        } catch (error) {
            console.error('Error al guardar item:', error);
        } finally {
            setGuardando(false);
        }
    };

    const handleClose = () => {
        if (!guardando) {
            onHide();
        }
    };

    if (!show) return null;

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className={`bi ${esEdicion ? 'bi-pencil' : 'bi-plus-circle'} me-2`}></i>
                            {esEdicion ? 'Editar Item' : 'Nuevo Item'}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={handleClose}
                            disabled={guardando}
                        ></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="row g-3">
                                {/* Nombre */}
                                <div className="col-md-8">
                                    <label htmlFor="nombre" className="form-label fw-semibold">
                                        <i className="bi bi-tag me-1"></i>
                                        Nombre del Item *
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                                        id="nombre"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        placeholder="Ej: Destornillador de cruz"
                                        disabled={!puedeEditar}
                                    />
                                    {errores.nombre && (
                                        <div className="invalid-feedback">{errores.nombre}</div>
                                    )}
                                </div>

                                {/* Estado */}
                                <div className="col-md-4">
                                    <label htmlFor="estado" className="form-label fw-semibold">
                                        <i className="bi bi-gear me-1"></i>
                                        Estado
                                    </label>
                                    <select
                                        className="form-select"
                                        id="estado"
                                        name="estado"
                                        value={formData.estado}
                                        onChange={handleInputChange}
                                        disabled={!puedeEditar}
                                    >
                                        <option value="disponible">Disponible</option>
                                        <option value="mantenimiento">Mantenimiento</option>
                                        <option value="dado_de_baja">Dado de baja</option>
                                    </select>
                                </div>

                                {/* Descripción */}
                                <div className="col-12">
                                    <label htmlFor="descripcion" className="form-label fw-semibold">
                                        <i className="bi bi-text-paragraph me-1"></i>
                                        Descripción
                                    </label>
                                    <textarea
                                        className="form-control"
                                        id="descripcion"
                                        name="descripcion"
                                        rows="3"
                                        value={formData.descripcion}
                                        onChange={handleInputChange}
                                        placeholder="Descripción detallada del item..."
                                        disabled={!puedeEditar}
                                    />
                                </div>

                                {/* Categoría */}
                                <div className="col-md-6">
                                    <label htmlFor="categoria_id" className="form-label fw-semibold">
                                        <i className="bi bi-tags me-1"></i>
                                        Categoría
                                    </label>
                                    <select
                                        className="form-select"
                                        id="categoria_id"
                                        name="categoria_id"
                                        value={formData.categoria_id}
                                        onChange={handleInputChange}
                                        disabled={!puedeEditar}
                                    >
                                        <option value="">Sin categoría</option>
                                        {categorias.map(categoria => (
                                            <option key={categoria.id} value={categoria.id}>
                                                {categoria.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Código de Inventario */}
                                <div className="col-md-6">
                                    <label htmlFor="codigo_inventario" className="form-label fw-semibold">
                                        <i className="bi bi-upc me-1"></i>
                                        Código de Inventario
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control font-monospace"
                                        id="codigo_inventario"
                                        name="codigo_inventario"
                                        value={formData.codigo_inventario}
                                        onChange={handleInputChange}
                                        placeholder="Ej: HERR-001"
                                        disabled={!puedeEditar}
                                    />
                                </div>

                                {/* Cantidad Total */}
                                <div className="col-md-6">
                                    <label htmlFor="cantidad_total" className="form-label fw-semibold">
                                        <i className="bi bi-hash me-1"></i>
                                        Cantidad Total *
                                    </label>
                                    <input
                                        type="number"
                                        className={`form-control ${errores.cantidad_total ? 'is-invalid' : ''}`}
                                        id="cantidad_total"
                                        name="cantidad_total"
                                        value={formData.cantidad_total}
                                        onChange={handleInputChange}
                                        min="0"
                                        placeholder="0"
                                        disabled={!puedeEditar}
                                    />
                                    {errores.cantidad_total && (
                                        <div className="invalid-feedback">{errores.cantidad_total}</div>
                                    )}
                                </div>

                                {/* Información adicional para edición */}
                                {esEdicion && (
                                    <div className="col-md-6">
                                        <label className="form-label fw-semibold">
                                            <i className="bi bi-info-circle me-1"></i>
                                            Cantidad Disponible
                                        </label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={item?.cantidad_disponible || 0}
                                                disabled
                                            />
                                            <span className="input-group-text">
                                                <i className="bi bi-check-circle text-success"></i>
                                            </span>
                                        </div>
                                        <small className="form-text text-muted">
                                            Cantidad actualmente disponible para préstamo
                                        </small>
                                    </div>
                                )}
                            </div>

                            {/* Información adicional para modo solo lectura */}
                            {esEdicion && !puedeEditar && (
                                <div className="alert alert-info mt-3">
                                    <i className="bi bi-info-circle me-2"></i>
                                    <strong>Solo lectura:</strong> No tienes permisos para editar items. 
                                    Solo los administradores pueden modificar el inventario.
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleClose}
                                disabled={guardando}
                            >
                                {esEdicion && !puedeEditar ? 'Cerrar' : 'Cancelar'}
                            </button>
                            
                            {puedeEditar && (
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={guardando}
                                >
                                    {guardando ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <i className={`bi ${esEdicion ? 'bi-check-lg' : 'bi-plus-circle'} me-2`}></i>
                                            {esEdicion ? 'Actualizar' : 'Crear Item'}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ItemModal;