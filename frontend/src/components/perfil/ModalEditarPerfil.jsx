import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import clienteAxios from '../../config/axios';
import Swal from 'sweetalert2';

const ModalEditarPerfil = ({ mostrar, onCerrar, usuario }) => {
    const { setAuth } = useAuth();
    
    const [formData, setFormData] = useState({
        nombre: '',
        email: ''
    });
    
    const [errores, setErrores] = useState({});
    const [enviando, setEnviando] = useState(false);

    // Cargar datos del usuario cuando se abre el modal
    useEffect(() => {
        if (mostrar && usuario) {
            setFormData({
                nombre: usuario.nombre || '',
                email: usuario.email || ''
            });
            setErrores({});
            setEnviando(false);
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

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const getConfig = () => ({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('lab_token')}`
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validarFormulario()) {
            return;
        }

        setEnviando(true);

        try {
            // Actualizar perfil personal
            const { data } = await clienteAxios.put('/auth/mi-perfil', {
                nombre: formData.nombre.trim(),
                email: formData.email.trim().toLowerCase()
            }, getConfig());

            // Actualizar el contexto de autenticación
            setAuth(prev => ({
                ...prev,
                nombre: data.usuario.nombre,
                email: data.usuario.email
            }));

            // Mostrar mensaje de éxito
            Swal.fire({
                title: '¡Perfil Actualizado!',
                text: 'Tu información personal ha sido actualizada correctamente',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            onCerrar();

        } catch (error) {
            const mensaje = error.response?.data?.msg || 'Error al actualizar el perfil';
            
            Swal.fire({
                title: 'Error',
                text: mensaje,
                icon: 'error',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#dc3545'
            });

            // Si el error es de email duplicado, marcarlo en el campo
            if (mensaje.toLowerCase().includes('email')) {
                setErrores({ email: mensaje });
            }
        } finally {
            setEnviando(false);
        }
    };

    if (!mostrar) return null;

    return (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">
                            <i className="bi bi-person-gear me-2"></i>
                            Editar Mi Perfil
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
                            {/* Avatar y tipo de usuario */}
                            <div className="text-center mb-4">
                                <div className="bg-primary bg-opacity-10 rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3" 
                                     style={{width: '80px', height: '80px'}}>
                                    <i className="bi bi-person text-primary" style={{fontSize: '2.5rem'}}></i>
                                </div>
                                <span className={`badge ${usuario?.tipo === 'admin' ? 'bg-danger' : 'bg-primary'} fs-6`}>
                                    {usuario?.tipo === 'admin' ? 'Administrador' : 'Encargado'}
                                </span>
                            </div>

                            {/* Campos editables */}
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
                                        placeholder="Tu nombre completo"
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
                                        placeholder="tu.email@ejemplo.com"
                                        disabled={enviando}
                                    />
                                    {errores.email && (
                                        <div className="invalid-feedback">{errores.email}</div>
                                    )}
                                </div>
                            </div>

                            {/* Información adicional */}
                            <div className="mt-4 p-3 bg-light rounded">
                                <h6 className="text-muted mb-2">
                                    <i className="bi bi-info-circle me-2"></i>
                                    Información de la Cuenta
                                </h6>
                                <div className="row g-2">
                                    <div className="col-6">
                                        <small className="text-muted d-block">Tipo de Usuario:</small>
                                        <span className="fw-medium">
                                            {usuario?.tipo === 'admin' ? 'Administrador' : 'Encargado'}
                                        </span>
                                    </div>
                                    <div className="col-6">
                                        <small className="text-muted d-block">ID de Usuario:</small>
                                        <span className="fw-medium">#{usuario?.id}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Nota sobre la contraseña */}
                            <div className="mt-3">
                                <div className="alert alert-info d-flex align-items-center" role="alert">
                                    <i className="bi bi-lightbulb me-2"></i>
                                    <small>
                                        Para cambiar tu contraseña, usa el botón "Cambiar Contraseña" 
                                        en tu perfil o desde el menú de navegación.
                                    </small>
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
                                disabled={enviando}
                            >
                                {enviando ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Actualizando...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-circle me-2"></i>
                                        Actualizar Perfil
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

export default ModalEditarPerfil;