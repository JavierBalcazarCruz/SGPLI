import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const AdminLayout = () => {
    const { auth, cerrarSesion } = useAuth();
    const location = useLocation();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const handleCerrarSesion = () => {
        cerrarSesion();
    };

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const menuItems = [
        {
            path: '/admin',
            icon: 'bi-speedometer2',
            label: 'Dashboard',
            exact: true
        },
        {
            path: '/admin/items',
            icon: 'bi-tools',
            label: 'Inventario',
            exact: false
        },
        {
            path: '/admin/prestamos',
            icon: 'bi-clipboard-check',
            label: 'Préstamos',
            exact: false
        },
        {
            path: '/admin/devoluciones',
            icon: 'bi-arrow-return-left',
            label: 'Devoluciones',
            exact: false
        }
    ];

    // Solo mostrar gestión de usuarios para admins
    if (auth.tipo === 'admin') {
        menuItems.push({
            path: '/admin/usuarios',
            icon: 'bi-people',
            label: 'Usuarios',
            exact: false
        });
    }

    const isActive = (path, exact) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="d-flex vh-100">
            {/* Sidebar */}
            <nav className={`bg-dark text-white ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
                <div className="p-3">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className={`${sidebarCollapsed ? 'd-none' : ''}`}>
                            <h5 className="mb-0">
                                <i className="bi bi-gear-fill me-2"></i>
                                Sistema Lab
                            </h5>
                            <small className="text-light opacity-75">
                                Gestión de Préstamos
                            </small>
                        </div>
                        <button
                            className="btn btn-outline-light btn-sm"
                            onClick={toggleSidebar}
                        >
                            <i className={`bi ${sidebarCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
                        </button>
                    </div>
                </div>

                <hr className="text-white-50 mx-3" />

                {/* Menu Items */}
                <ul className="nav nav-pills flex-column px-3">
                    {menuItems.map((item) => (
                        <li key={item.path} className="nav-item mb-1">
                            <Link
                                to={item.path}
                                className={`nav-link text-white d-flex align-items-center ${
                                    isActive(item.path, item.exact) ? 'active bg-primary' : ''
                                }`}
                            >
                                <i className={`bi ${item.icon} ${sidebarCollapsed ? '' : 'me-2'}`}></i>
                                {!sidebarCollapsed && <span>{item.label}</span>}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* User Info */}
                <div className="mt-auto p-3">
                    <div className="dropdown dropup">
                        <button
                            className="btn btn-outline-light w-100 d-flex align-items-center justify-content-between"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <div className="d-flex align-items-center">
                                <i className="bi bi-person-circle me-2"></i>
                                {!sidebarCollapsed && (
                                    <div className="text-start">
                                        <div className="fw-semibold" style={{fontSize: '0.9rem'}}>
                                            {auth.nombre}
                                        </div>
                                        <small className="text-light opacity-75">
                                            {auth.tipo}
                                        </small>
                                    </div>
                                )}
                            </div>
                            {!sidebarCollapsed && <i className="bi bi-three-dots-vertical"></i>}
                        </button>
                        <ul className="dropdown-menu dropdown-menu-dark">
                            <li>
                                <Link className="dropdown-item" to="/admin/perfil">
                                    <i className="bi bi-person-gear me-2"></i>
                                    Mi Perfil
                                </Link>
                            </li>
                            <li>
                                <Link className="dropdown-item" to="/admin/cambiar-password">
                                    <i className="bi bi-key me-2"></i>
                                    Cambiar Contraseña
                                </Link>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                                <button 
                                    className="dropdown-item text-danger" 
                                    onClick={handleCerrarSesion}
                                >
                                    <i className="bi bi-box-arrow-right me-2"></i>
                                    Cerrar Sesión
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow-1 bg-light overflow-auto">
                <Outlet />
            </main>

            <style jsx>{`
                .sidebar-expanded {
                    width: 280px;
                    transition: width 0.3s ease;
                }
                
                .sidebar-collapsed {
                    width: 80px;
                    transition: width 0.3s ease;
                }
                
                .sidebar-collapsed .nav-link {
                    justify-content: center;
                }
                
                .nav-link {
                    border-radius: 0.375rem;
                    transition: all 0.2s ease;
                }
                
                .nav-link:hover {
                    background-color: rgba(255, 255, 255, 0.1) !important;
                }
                
                .nav-link.active {
                    background-color: var(--bs-primary) !important;
                }
            `}</style>
        </div>
    );
};

export default AdminLayout;