import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import clienteAxios from '../config/axios';
import useAuth from '../hooks/useAuth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cargando, setCargando] = useState(false);

    const { setAuth } = useAuth();
    const navigate = useNavigate();

    const mostrarAlerta = (titulo, mensaje, tipo = 'error') => {
        Swal.fire({
            title: titulo,
            text: mensaje,
            icon: tipo,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#0d6efd'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones
        if ([email, password].includes('')) {
            mostrarAlerta('Campos vacíos', 'Todos los campos son obligatorios');
            return;
        }

        setCargando(true);

        try {
            const { data } = await clienteAxios.post('/auth/login', {
                email: email.trim().toLowerCase(),
                password
            });

            // Guardar token en localStorage
            localStorage.setItem('lab_token', data.token);
            
            // Establecer usuario autenticado
            setAuth(data);

            // Mostrar mensaje de éxito
            Swal.fire({
                title: '¡Bienvenido!',
                text: `Hola ${data.nombre}, acceso autorizado`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            // Redirigir al dashboard
            navigate('/admin');

        } catch (error) {
            mostrarAlerta(
                'Error de autenticación',
                error.response?.data?.msg || 'Credenciales incorrectas'
            );
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 col-xl-5">
                <div className="card shadow-lg border-0 rounded-4">
                    <div className="card-header bg-primary text-white text-center py-4 rounded-top-4">
                        <div className="mb-3">
                            <i className="bi bi-gear-fill display-1"></i>
                        </div>
                        <h2 className="fw-bold mb-0">Sistema Laboratorio</h2>
                        <p className="mb-0 opacity-75">Gestión de Préstamos</p>
                    </div>
                    
                    <div className="card-body p-5">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="email" className="form-label fw-semibold">
                                    <i className="bi bi-envelope me-2"></i>
                                    Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    className="form-control form-control-lg"
                                    id="email"
                                    placeholder="Ingresa tu email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={cargando}
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="password" className="form-label fw-semibold">
                                    <i className="bi bi-lock me-2"></i>
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    className="form-control form-control-lg"
                                    id="password"
                                    placeholder="Ingresa tu contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={cargando}
                                />
                            </div>

                            <div className="d-grid mb-4">
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg"
                                    disabled={cargando}
                                >
                                    {cargando ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Iniciando sesión...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-box-arrow-in-right me-2"></i>
                                            Iniciar Sesión
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="text-center">
                            <Link 
                                to="/olvide-password" 
                                className="text-decoration-none text-muted"
                            >
                                <i className="bi bi-question-circle me-1"></i>
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                    </div>

                    <div className="card-footer bg-light text-center py-3 rounded-bottom-4">
                        <small className="text-muted">
                            <i className="bi bi-shield-check me-1"></i>
                            Sistema Seguro - Laboratorio de Informática
                        </small>
                    </div>
                </div>

                {/* Información adicional */}
                <div className="text-center mt-4">
                    <div className="row g-3">
                        <div className="col-4">
                            <div className="card bg-success text-white">
                                <div className="card-body py-2">
                                    <i className="bi bi-tools"></i>
                                    <small className="d-block">Herramientas</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="card bg-info text-white">
                                <div className="card-body py-2">
                                    <i className="bi bi-clipboard-check"></i>
                                    <small className="d-block">Préstamos</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-4">
                            <div className="card bg-warning text-white">
                                <div className="card-body py-2">
                                    <i className="bi bi-graph-up"></i>
                                    <small className="d-block">Reportes</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;