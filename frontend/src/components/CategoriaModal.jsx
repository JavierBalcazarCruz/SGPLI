import { useState, useEffect } from 'react';
import useItems from '../hooks/useItems';

const CategoriaModal = ({ show, onHide, categoria }) => {
    const { crearCategoria, actualizarCategoria } = useItems();
    
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: ''
    });
    
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});

    const esEdicion = Boolean(categoria);

    // Cargar datos de la categoría cuando se abre el modal
    useEffect(() => {
        if (show && categoria) {
            setFormData({
                nombre: categoria.nombre || '',
                descripcion: categoria.descripcion || ''
            });
        } else if (show && !categoria) {
            // Limpiar formulario para nueva categoría
            setFormData({
                nombre: '',
                descripcion: ''
            });
        }
        setErrores({});
    }, [show, categoria]);

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
            nuevosErrores.nombre = 'El nombre de la categoría es obligatorio';
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
                nombre: formData.nombre.trim(),
                descripcion: formData.descripcion.trim() || null
            };

            let resultado;
            if (esEdicion) {
                resultado = await actualizarCategoria(categoria.id, datos);
            } else {
                resultado = await crearCategoria(datos);
            }

            if (resultado.success) {
                onHide();
            }
        } catch (error) {
            console.error('Error al guardar categoría:', error);
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
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className={`bi ${esEdicion ? 'bi-pencil' : 'bi-plus-circle'} me-2`}></i>
                            {esEdicion ? 'Editar Categoría' : 'Nueva Categoría'}
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
                                <div className="col-12">
                                    <label htmlFor="categoriaNombre" className="form-label fw-semibold">
                                        <i className="bi bi-tag me-1"></i>
                                        Nombre de la Categoría *
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                                        id="categoriaNombre"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        placeholder="Ej: Herramientas, Materiales, Equipos..."
                                        maxLength="50"
                                    />
                                    {errores.nombre && (
                                        <div className="invalid-feedback">{errores.nombre}</div>
                                    )}
                                    <div className="form-text">
                                        Máximo 50 caracteres
                                    </div>
                                </div>

                                {/* Descripción */}
                                <div className="col-12">
                                    <label htmlFor="categoriaDescripcion" className="form-label fw-semibold">
                                        <i className="bi bi-text-paragraph me-1"></i>
                                        Descripción
                                    </label>
                                    <textarea
                                        className="form-control"
                                        id="categoriaDescripcion"
                                        name="descripcion"
                                        rows="3"
                                        value={formData.descripcion}
                                        onChange={handleInputChange}
                                        placeholder="Descripción opcional de la categoría..."
                                        maxLength="255"
                                    />
                                    <div className="form-text">
                                        Opcional - Máximo 255 caracteres
                                    </div>
                                </div>
                            </div>

                            {/* Preview de la categoría */}
                            {formData.nombre && (
                                <div className="mt-3">
                                    <label className="form-label fw-semibold">
                                        <i className="bi bi-eye me-1"></i>
                                        Vista previa:
                                    </label>
                                    <div className="card bg-light">
                                        <div className="card-body py-2">
                                            <div className="d-flex align-items-center">
                                                <span className="badge bg-primary me-2">
                                                    {formData.nombre}
                                                </span>
                                                {formData.descripcion && (
                                                    <small className="text-muted">
                                                        {formData.descripcion}
                                                    </small>
                                                )}
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
                                onClick={handleClose}
                                disabled={guardando}
                            >
                                Cancelar
                            </button>
                            
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
                                        {esEdicion ? 'Actualizar' : 'Crear Categoría'}
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

export default CategoriaModal;