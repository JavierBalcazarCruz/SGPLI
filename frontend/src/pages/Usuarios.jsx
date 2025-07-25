import { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import useUsuarios from '../hooks/useUsuarios';
import ModalUsuario from '../components/usuarios/ModalUsuario';

const Usuarios = () => {
    const { auth } = useAuth();
    const { 
        usuarios, 
        cargando, 
        toggleUsuario, 
        buscarUsuarios,
        filtrarPorEstado,
        filtrarPorTipo,
        obtenerEstadisticasUsuarios
    } = useUsuarios();

    const [mostrarModal, setMostrarModal] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState(null);
    const [filtros, setFiltros] = useState({
        busqueda: '',
        estado: 'todos',
        tipo: 'todos'
    });
    const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);

    // Aplicar filtros cuando cambien
    useEffect(() => {
        let resultado = usuarios;

        // Filtrar por búsqueda
        if (filtros.busqueda) {
            resultado = buscarUsuarios(filtros.busqueda);
        }

        // Filtrar por estado
        if (filtros.estado !== 'todos') {
            resultado = filtrarPorEstado(filtros.estado);
        }

        // Filtrar por tipo
        if (filtros.tipo !== 'todos') {
            resultado = filtrarPorTipo(filtros.tipo);
        }

        // Si hay múltiples filtros, aplicarlos en cascada
        if (filtros.busqueda && filtros.estado !== 'todos') {
            resultado = buscarUsuarios(filtros.busqueda).filter(u => 
                filtros.estado === 'activos' ? u.activo === 1 : u.activo === 0
            );
        }

        if (filtros.busqueda && filtros.tipo !== 'todos') {
            resultado = buscarUsuarios(filtros.busqueda).filter(u => u.tipo === filtros.tipo);
        }

        if (filtros.estado !== 'todos' && filtros.tipo !== 'todos') {
            const activo = filtros.estado === 'activos' ? 1 : 0;
            resultado = usuarios.filter(u => u.activo === activo && u.tipo === filtros.tipo);
        }

        if (filtros.busqueda && filtros.estado !== 'todos' && filtros.tipo !== 'todos') {
            const activo = filtros.estado === 'activos' ? 1 : 0;
            resultado = buscarUsuarios(filtros.busqueda).filter(u => 
                u.activo === activo && u.tipo === filtros.tipo
            );
        }

        setUsuariosFiltrados(resultado);
    }, [usuarios, filtros, buscarUsuarios, filtrarPorEstado, filtrarPorTipo]);

    const handleFiltroChange = (campo, valor) => {
        setFiltros(prev => ({ ...prev, [campo]: valor }));
    };

    const limpiarFiltros = () => {
        setFiltros({
            busqueda: '',
            estado: 'todos',
            tipo: 'todos'
        });
    };

    const handleNuevoUsuario = () => {
        setUsuarioEditando(null);
        setMostrarModal(true);
    };

    const handleEditarUsuario = (usuario) => {
        setUsuarioEditando(usuario);
        setMostrarModal(true);
    };

    const handleToggleUsuario = async (id) => {
        await toggleUsuario(id);
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const getTipoBadge = (tipo) => {
        return tipo === 'admin' ? 'bg-danger' : 'bg-primary';
    };

    const getEstadoBadge = (activo) => {
        return activo ? 'bg-success' : 'bg-secondary';
    };

    const estadisticas = obtenerEstadisticasUsuarios();
    const tienesFiltrosActivos = filtros.busqueda || filtros.estado !== 'todos' || filtros.tipo !== 'todos';

    // Verificar que el usuario actual es admin
    if (auth.tipo !== 'admin') {
        return (
            <div className="container-fluid py-4">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card text-center">
                            <div className="card-body">
                                <i className="bi bi-shield-exclamation display-1 text-warning"></i>
                                <h4 className="mt-3">Acceso Denegado</h4>
                                <p className="text-muted">
                                    Solo los administradores pueden acceder a la gestión de usuarios.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (cargando) {
        return (
            <div className="container-fluid py-4">
                <div className="d-flex justify-content-center align-items-center" style={{minHeight: '400px'}}>
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Cargando usuarios...</span>
                        </div>
                        <p className="mt-3 text-muted">Cargando usuarios...</p>
                    </div>
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
                            <h2 className="mb-1">
                                <i className="bi bi-people text-primary me-3"></i>
                                Gestión de Usuarios
                            </h2>
                            <p className="text-muted mb-0">
                                Administra los usuarios del sistema de préstamos
                            </p>
                        </div>
                        <button 
                            className="btn btn-primary"
                            onClick={handleNuevoUsuario}
                        >
                            <i className="bi bi-person-plus me-2"></i>
                            Nuevo Usuario
                        </button>
                    </div>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center">
                            <i className="bi bi-people text-primary fs-1 mb-2"></i>
                            <h4 className="mb-1">{estadisticas.total}</h4>
                            <small className="text-muted">Total Usuarios</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center">
                            <i className="bi bi-person-check text-success fs-1 mb-2"></i>
                            <h4 className="mb-1">{estadisticas.activos}</h4>
                            <small className="text-muted">Activos</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center">
                            <i className="bi bi-person-x text-secondary fs-1 mb-2"></i>
                            <h4 className="mb-1">{estadisticas.inactivos}</h4>
                            <small className="text-muted">Inactivos</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center">
                            <i className="bi bi-shield text-danger fs-1 mb-2"></i>
                            <h4 className="mb-1">{estadisticas.admins}</h4>
                            <small className="text-muted">Administradores</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center">
                            <i className="bi bi-person-gear text-primary fs-1 mb-2"></i>
                            <h4 className="mb-1">{estadisticas.encargados}</h4>
                            <small className="text-muted">Encargados</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="card shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-4">
                            <label className="form-label">Buscar usuarios</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Buscar por nombre o email..."
                                value={filtros.busqueda}
                                onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
                            />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Estado</label>
                            <select
                                className="form-select"
                                value={filtros.estado}
                                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                            >
                                <option value="todos">Todos</option>
                                <option value="activos">Activos</option>
                                <option value="inactivos">Inactivos</option>
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Tipo</label>
                            <select
                                className="form-select"
                                value={filtros.tipo}
                                onChange={(e) => handleFiltroChange('tipo', e.target.value)}
                            >
                                <option value="todos">Todos</option>
                                <option value="admin">Administrador</option>
                                <option value="encargado">Encargado</option>
                            </select>
                        </div>
                        <div className="col-md-4 d-flex gap-2">
                            {tienesFiltrosActivos && (
                                <button 
                                    className="btn btn-outline-secondary"
                                    onClick={limpiarFiltros}
                                >
                                    <i className="bi bi-x-circle me-1"></i>
                                    Limpiar
                                </button>
                            )}
                            <div className="ms-auto">
                                <small className="text-muted">
                                    {usuariosFiltrados.length} de {usuarios.length} usuarios
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla de Usuarios */}
            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Usuario</th>
                                    <th>Email</th>
                                    <th>Tipo</th>
                                    <th>Estado</th>
                                    <th>Fecha Registro</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuariosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4">
                                            <div className="text-muted">
                                                <i className="bi bi-person-x fs-1 d-block mb-2"></i>
                                                {tienesFiltrosActivos 
                                                    ? 'No se encontraron usuarios con los filtros aplicados'
                                                    : 'No hay usuarios registrados'
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    usuariosFiltrados.map(usuario => (
                                        <tr key={usuario.id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                                        <i className="bi bi-person text-primary"></i>
                                                    </div>
                                                    <div>
                                                        <div className="fw-medium">{usuario.nombre}</div>
                                                        {usuario.id === auth.id && (
                                                            <small className="text-muted">(Tú)</small>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{usuario.email}</td>
                                            <td>
                                                <span className={`badge ${getTipoBadge(usuario.tipo)}`}>
                                                    {usuario.tipo === 'admin' ? 'Administrador' : 'Encargado'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${getEstadoBadge(usuario.activo)}`}>
                                                    {usuario.activo ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td>
                                                <small>{formatearFecha(usuario.fecha_creacion)}</small>
                                            </td>
                                            <td>
                                                <div className="btn-group btn-group-sm">
                                                    <button 
                                                        className="btn btn-outline-primary"
                                                        title="Editar usuario"
                                                        onClick={() => handleEditarUsuario(usuario)}
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    {usuario.id !== auth.id && (
                                                        <button 
                                                            className={`btn ${usuario.activo ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                                            title={usuario.activo ? 'Desactivar usuario' : 'Activar usuario'}
                                                            onClick={() => handleToggleUsuario(usuario.id)}
                                                        >
                                                            <i className={`bi ${usuario.activo ? 'bi-person-dash' : 'bi-person-check'}`}></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <ModalUsuario 
                mostrar={mostrarModal}
                onCerrar={() => setMostrarModal(false)}
                usuario={usuarioEditando}
            />
        </div>
    );
};

export default Usuarios;