import { Outlet, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const RutaProtegida = () => {
    const { auth, cargando } = useAuth();

    if (cargando) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-3 text-muted">Verificando autenticación...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {auth?.id ? <Outlet /> : <Navigate to="/" />}
        </>
    );
};

export default RutaProtegida;