import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import Swal from 'sweetalert2';

const ModalCambiarPassword = ({ mostrar, onCerrar }) => {
    const { cambiarPassword } = useAuth();
    
    const [formData, setFormData] = useState({
        passwordActual: '',
        passwordNuevo: '',
        confirmarPassword: ''
    });
    
    const [errores, setErrores] = useState({});
    const [enviando, setEnviando] = useState(false);
    const [mostrarPasswords, setMostrarPasswords] = useState({
        actual: false,
        nuevo: false,
        confirmar: false
    });

    // Resetear formulario cuando se abre/cierra el modal
    useEffect(() => {
        if (mostrar) {
            setFormData({
                passwordActual: '',
                passwordNuevo: '',
                confirmarPassword: ''
            });
            setErrores({});
            setEnviando(false);
            setMostrarPasswords({
                actual: false,
                nuevo: false,
                confirmar: false
            });
        }
    }, [mostrar]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errores[name]) {
            setErrores(prev => ({ ...prev, [name]: '' }));
        }
    };

    const toggleMostrarPassword = (campo) => {
        setMostrarPasswords(prev => ({
            ...prev,
            [campo]: !prev[campo]
        }));
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        // Validar password actual
        if (!formData.passwordActual) {
            nuevosErrores.passwordActual = 'La contraseña actual es obligatoria';
        }

        // Validar password nuevo
        if (!formData.passwordNuevo) {
            nuevosErrores.passwordNuevo = 'La nueva contraseña es obligatoria';
        } else if (formData.passwordNuevo.length < 6) {
            nuevosErrores.passwordNuevo = 'La nueva contraseña debe tener al menos 6 caracteres';
        } else if (formData.passwordNuevo === formData.passwordActual) {
            nuevosErrores.passwordNuevo = 'La nueva contraseña debe ser diferente a la actual';
        }

        // Validar confirmación de password
        if (!formData.confirmarPassword) {
            nuevosErrores.confirmarPassword = 'Debe confirmar la nueva contraseña';
        } else if (formData.passwordNuevo !== formData.confirmarPassword) {
            nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden';
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

        try {
            const resultado = await cambiarPassword({
                passwordActual: formData.passwordActual,
                passwordNuevo: formData.passwordNuevo
            });

            if (resultado.error) {
                // Error del backend
                if (resultado.msg.toLowerCase().includes('actual incorrecto')) {
                    setErrores({ passwordActual: resultado.msg });
                } else {
                    Swal.fire({
                        title: 'Error',
                        text: resultado.msg,
                        icon: 'error',
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#dc3545'
                    });
                }
            } else {
                // Éxito
                Swal.fire({
                    title: '¡Contraseña Cambiada!',
                    text: 'Tu contraseña ha sido actualizada correctamente',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });

                onCerrar();
            }

        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Ocurrió un error inesperado. Inténtalo nuevamente.',
                icon: 'error',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#dc3545'
            });
        } finally {
            setEnviando(false);
        }
    };

    const getPasswordStrength = (password) => {
        if (!password) return { level: 0, text: '', color: 'secondary' };
        
        let score = 0;
        let feedback = [];

        // Longitud
        if (password.length >= 6) score += 1;
        if (password.length >= 8) score += 1;

        // Complejidad
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        if (password.length < 6) feedback.push('Mínimo 6 caracteres');
        if (!/[A-Za-z]/.test(password)) feedback.push('Incluye letras');
        if (!/[0-9]/.test(password)) feedback.push('Incluye números');

        const levels = [
            { level: 0, text: '', color: 'secondary' },
            { level: 1, text: 'Muy débil', color: 'danger' },
            { level: 2, text: 'Débil', color: 'warning' },
            { level: 3, text: 'Regular', color: 'info' },
            { level: 4, text: 'Fuerte', color: 'success' },
            { level: 5, text: 'Muy fuerte', color: 'success' },
            { level: 6, text: 'Excelente', color: 'success' }
        ];

        return levels[Math.min(score, 6)];
    };

    const passwordStrength = getPasswordStrength(formData.passwordNuevo);

    if (!mostrar) return null;

    return (
        <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header bg-warning text-dark">
                        <h5 className="modal-title">
                            <i className="bi bi-key me-2"></i>
                            Cambiar Contraseña
                        </h5>
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={onCerrar}
                            disabled={enviando}
                        ></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {/* Contraseña Actual */}
                            <div className="mb-3">
                                <label className="form-label">
                                    Contraseña actual <span className="text-danger">*</span>
                                </label>
                                <div className="input-group">
                                    <input
                                        type={mostrarPasswords.actual ? "text" : "password"}
                                        className={`form-control ${errores.passwordActual ? 'is-invalid' : ''}`}
                                        name="passwordActual"
                                        value={formData.passwordActual}
                                        onChange={handleInputChange}
                                        placeholder="Ingresa tu contraseña actual"
                                        disabled={enviando}
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => toggleMostrarPassword('actual')}
                                        disabled={enviando}
                                    >
                                        <i className={`bi ${mostrarPasswords.actual ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                    </button>
                                    {errores.passwordActual && (
                                        <div className="invalid-feedback">{errores.passwordActual}</div>
                                    )}
                                </div>
                            </div>

                            {/* Nueva Contraseña */}
                            <div className="mb-3">
                                <label className="form-label">
                                    Nueva contraseña <span className="text-danger">*</span>
                                </label>
                                <div className="input-group">
                                    <input
                                        type={mostrarPasswords.nuevo ? "text" : "password"}
                                        className={`form-control ${errores.passwordNuevo ? 'is-invalid' : ''}`}
                                        name="passwordNuevo"
                                        value={formData.passwordNuevo}
                                        onChange={handleInputChange}
                                        placeholder="Mínimo 6 caracteres"
                                        disabled={enviando}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => toggleMostrarPassword('nuevo')}
                                        disabled={enviando}
                                    >
                                        <i className={`bi ${mostrarPasswords.nuevo ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                    </button>
                                    {errores.passwordNuevo && (
                                        <div className="invalid-feedback">{errores.passwordNuevo}</div>
                                    )}
                                </div>
                                
                                {/* Indicador de fuerza de contraseña */}
                                {formData.passwordNuevo && (
                                    <div className="mt-2">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <small className="text-muted">Fuerza de la contraseña:</small>
                                            <small className={`text-${passwordStrength.color}`}>
                                                {passwordStrength.text}
                                            </small>
                                        </div>
                                        <div className="progress" style={{height: '4px'}}>
                                            <div 
                                                className={`progress-bar bg-${passwordStrength.color}`}
                                                style={{width: `${(passwordStrength.level / 6) * 100}%`}}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Confirmar Nueva Contraseña */}
                            <div className="mb-3">
                                <label className="form-label">
                                    Confirmar nueva contraseña <span className="text-danger">*</span>
                                </label>
                                <div className="input-group">
                                    <input
                                        type={mostrarPasswords.confirmar ? "text" : "password"}
                                        className={`form-control ${errores.confirmarPassword ? 'is-invalid' : ''}`}
                                        name="confirmarPassword"
                                        value={formData.confirmarPassword}
                                        onChange={handleInputChange}
                                        placeholder="Repite la nueva contraseña"
                                        disabled={enviando}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => toggleMostrarPassword('confirmar')}
                                        disabled={enviando}
                                    >
                                        <i className={`bi ${mostrarPasswords.confirmar ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                    </button>
                                    {errores.confirmarPassword && (
                                        <div className="invalid-feedback">{errores.confirmarPassword}</div>
                                    )}
                                </div>
                                
                                {/* Indicador de coincidencia */}
                                {formData.confirmarPassword && (
                                    <div className="mt-1">
                                        {formData.passwordNuevo === formData.confirmarPassword ? (
                                            <small className="text-success">
                                                <i className="bi bi-check-circle me-1"></i>
                                                Las contraseñas coinciden
                                            </small>
                                        ) : (
                                            <small className="text-danger">
                                                <i className="bi bi-x-circle me-1"></i>
                                                Las contraseñas no coinciden
                                            </small>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Consejos de seguridad */}
                            <div className="alert alert-info" role="alert">
                                <h6 className="alert-heading">
                                    <i className="bi bi-lightbulb me-2"></i>
                                    Consejos para una contraseña segura:
                                </h6>
                                <ul className="mb-0 ps-3">
                                    <li>Usa al menos 6 caracteres (recomendado: 8 o más)</li>
                                    <li>Combina letras mayúsculas y minúsculas</li>
                                    <li>Incluye números y símbolos especiales</li>
                                    <li>Evita información personal como nombres o fechas</li>
                                </ul>
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
                                className="btn btn-warning"
                                disabled={enviando}
                            >
                                {enviando ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Cambiando...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-shield-check me-2"></i>
                                        Cambiar Contraseña
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

export default ModalCambiarPassword;