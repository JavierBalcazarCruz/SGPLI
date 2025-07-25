import { useState, useEffect } from 'react';
import useUsuarios from '../../hooks/useUsuarios';
import useAuth from '../../hooks/useAuth';

const ModalUsuario = ({ mostrar, onCerrar, usuario }) => {
    const { crearUsuario, actualizarUsuario } = useUsuarios();
    const { auth } = useAuth();
    
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        confirmarPassword: '',
        tipo: 'encargado'
    });
    
    const [errores, setErrores] = useState({});
    const [enviando, setEnviando] = useState(false);
    const [mostrarPassword, setMostrarPassword] = useState(false);

    const esEdicion = !!usuario;

    // Resetear formulario cuando se abre/cierra el modal o cambia el usuario
    useEffect(() => {
        if (mostrar) {
            if (usuario) {
                // Modo edición
                setFormData({
                    nombre: usuario.nombre || '',
                    email: usuario.email || '',
                    password: '',
                    confirmarPassword: '',
                    tipo: usuario.tipo || 'encargado'
                });
            } else {
                // Modo creación
                setFormData({
                    nombre: '',
                    email: '',
                    password: '',
                    confirmarPassword: '',
                    tipo: 'encargado'
                });
            }
            setErrores({});
            setEnviando(false);
            setMostrarPassword(false);
        }
    }, [mostrar, usuario]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errores[name]) {
            setErrores(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        // Validar nombre
        if (!formData.nombre.trim()) {
            nuevosErrores.nombre = 'El nombre es obligatorio';
        } else if (formData.nombre.trim().length < 2) {
            nuevosErrores.nombre = 'El nombre debe tener al menos 2 caracteres';
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            nuevosErrores.email = 'El email es obligatorio';
        } else if (!emailRegex.test(formData.email.trim())) {
            nuevosErrores.email = 'El formato del email no es válido';
        }

        // Validar password (solo en creación o si se ingresó uno en edición)
        if (!esEdicion || formData.password) {
            if (!formData.password) {
                nuevosErrores.password = 'La contraseña es obligatoria';
            } else if (formData.password.length < 6) {
                nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
            }

            // Validar confirmación de password
            if (!formData.confirmarPassword) {
                nuevosErrores.confirmarPassword = 'Debe confirmar la contraseña';
            } else if (formData.password !== formData.confirmarPassword) {
                nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden';
            }
        }

        // Validar tipo
        if (!formData.tipo) {
            nuevosErrores.tipo = 'Debe seleccionar un tipo de usuario';
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validarFormulario()) {
            return;
        }

        setEnviando(true);

        // Preparar datos para envío
        const datosUsuario = {
            nombre: formData.nombre.trim(),
            email: formData.email.trim().toLowerCase(),
            tipo: formData.tipo
        };

        // Agregar password solo si se proporcionó
        if (formData.password) {
            datosUsuario.password = formData.password;
        }

        let resultado;
        if (esEdicion) {
            resultado = await actualizarUsuario(usuario.id, datosUsuario);
        } else {
            resultado = await crearUsuario(datosUsuario);
        }

        if (resultado.success) {
            onCerrar();
        }

        setEnviando(false);
    };

    if (!mostrar) return null;

    return (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">
                            <i className={`bi ${esEdicion ? 'bi-pencil' : 'bi-person-plus'} me-2`}></i>
                            {esEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}
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
                            {/* Información del Usuario */}
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label">
                                        Nombre completo <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        placeholder="Ej: Juan Pérez García"
                                        disabled={enviando}
                                    />
                                    {errores.nombre && (
                                        <div className="invalid-feedback">{errores.nombre}</div>
                                    )}
                                </div>

                                <div className="col-12">
                                    <label className="form-label">
                                        Correo electrónico <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className={`form-control ${errores.email ? 'is-invalid' : ''}`}
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Ej: juan.perez@laboratorio.com"
                                        disabled={enviando}
                                    />
                                    {errores.email && (
                                        <div className="invalid-feedback">{errores.email}</div>
                                    )}
                                </div>

                                <div className="col-12">
                                    <label className="form-label">
                                        Tipo de usuario <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className={`form-select ${errores.tipo ? 'is-invalid' : ''}`}
                                        name="tipo"
                                        value={formData.tipo}
                                        onChange={handleInputChange}
                                        disabled={enviando || (esEdicion && usuario?.id === auth.id)}
                                    >
                                        <option value="encargado">Encargado</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                    {errores.tipo && (
                                        <div className="invalid-feedback">{errores.tipo}</div>
                                    )}
                                    {esEdicion && usuario?.id === auth.id && (
                                        <small className="text-muted">
                                            No puedes cambiar tu propio tipo de usuario
                                        </small>
                                    )}
                                </div>

                                {/* Sección de Contraseña */}
                                <div className="col-12">
                                    <hr className="my-3" />
                                    <h6 className="text-muted mb-3">
                                        {esEdicion ? 'Cambiar Contraseña (Opcional)' : 'Contraseña'}
                                    </h6>
                                </div>

                                <div className="col-12">
                                    <label className="form-label">
                                        {esEdicion ? 'Nueva contraseña' : 'Contraseña'} 
                                        {!esEdicion && <span className="text-danger">*</span>}
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type={mostrarPassword ? "text" : "password"}
                                            className={`form-control ${errores.password ? 'is-invalid' : ''}`}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder={esEdicion ? "Dejar en blanco para mantener actual" : "Mínimo 6 caracteres"}
                                            disabled={enviando}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => setMostrarPassword(!mostrarPassword)}
                                            disabled={enviando}
                                        >
                                            <i className={`bi ${mostrarPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                        </button>
                                        {errores.password && (
                                            <div className="invalid-feedback">{errores.password}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="col-12">
                                    <label className="form-label">
                                        Confirmar contraseña 
                                        {(!esEdicion || formData.password) && <span className="text-danger">*</span>}
                                    </label>
                                    <input
                                        type={mostrarPassword ? "text" : "password"}
                                        className={`form-control ${errores.confirmarPassword ? 'is-invalid' : ''}`}
                                        name="confirmarPassword"
                                        value={formData.confirmarPassword}
                                        onChange={handleInputChange}
                                        placeholder="Repetir la contraseña"
                                        disabled={enviando}
                                    />
                                    {errores.confirmarPassword && (
                                        <div className="invalid-feedback">{errores.confirmarPassword}</div>
                                    )}
                                </div>
                            </div>

                            {/* Información adicional */}
                            {esEdicion && (
                                <div className="mt-4 p-3 bg-light rounded">
                                    <h6 className="text-muted mb-2">Información del Usuario</h6>
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <small className="text-muted d-block">Estado:</small>
                                            <span className={`badge ${usuario.activo ? 'bg-success' : 'bg-secondary'}`}>
                                                {usuario.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-muted d-block">Fecha de registro:</small>
                                            <span className="fw-medium">
                                                {new Date(usuario.fecha_creacion).toLocaleDateString('es-ES')}
                                            </span>
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
                                disabled={enviando}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={enviando}
                            >
                                {enviando ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        {esEdicion ? 'Actualizando...' : 'Creando...'}
                                    </>
                                ) : (
                                    <>
                                        <i className={`bi ${esEdicion ? 'bi-check-circle' : 'bi-person-plus'} me-2`}></i>
                                        {esEdicion ? 'Actualizar Usuario' : 'Crear Usuario'}
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

export default ModalUsuario;