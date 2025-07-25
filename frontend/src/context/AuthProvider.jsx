import { useState, useEffect, createContext } from 'react';
import clienteAxios from '../config/axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({});
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const autenticarUsuario = async () => {
            const token = localStorage.getItem('lab_token');
            
            if (!token) {
                setCargando(false);
                return;
            }

            // Validar formato básico del token JWT
            if (!isValidJWTFormat(token)) {
                console.log('Token con formato inválido, limpiando...');
                localStorage.removeItem('lab_token');
                setAuth({});
                setCargando(false);
                return;
            }

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            try {
                const { data } = await clienteAxios('/auth/perfil', config);
                setAuth(data);
            } catch (error) {
                console.log('Error de autenticación:', error.response?.data?.msg);
                
                // Si el token es inválido o expiró, limpiar
                if (error.response?.status === 403 || error.response?.status === 401) {
                    localStorage.removeItem('lab_token');
                    setAuth({});
                }
            }
            
            setCargando(false);
        };

        autenticarUsuario();
    }, []);

    // Función para validar formato básico de JWT
    const isValidJWTFormat = (token) => {
        if (!token || typeof token !== 'string') return false;
        
        // Un JWT válido tiene 3 partes separadas por puntos
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        
        // Verificar que no esté vacío y no tenga espacios
        if (token.trim() !== token || token.includes(' ')) return false;
        
        // Verificar que cada parte sea base64 válida (básico)
        try {
            for (let part of parts) {
                if (part.length === 0) return false;
                // Intentar decodificar base64 (solo las primeras dos partes)
                if (parts.indexOf(part) < 2) {
                    atob(part.replace(/-/g, '+').replace(/_/g, '/'));
                }
            }
            return true;
        } catch (e) {
            return false;
        }
    };

    const cerrarSesion = () => {
        localStorage.removeItem('lab_token');
        setAuth({});
    };

    const cambiarPassword = async (datos) => {
        const token = localStorage.getItem('lab_token');
        if (!token) return { error: true, msg: 'No autorizado' };

        // Validar token antes de usarlo
        if (!isValidJWTFormat(token)) {
            localStorage.removeItem('lab_token');
            setAuth({});
            return { error: true, msg: 'Sesión inválida, inicia sesión nuevamente' };
        }

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        try {
            const { data } = await clienteAxios.put('/auth/cambiar-password', datos, config);
            return { msg: data.msg };
        } catch (error) {
            return {
                msg: error.response?.data?.msg || 'Error del servidor',
                error: true
            };
        }
    };

    // Función para limpiar token corrupto manualmente
    const limpiarTokenCorrupto = () => {
        localStorage.removeItem('lab_token');
        setAuth({});
        window.location.reload();
    };

    return (
        <AuthContext.Provider value={{
            auth,
            setAuth,
            cargando,
            cerrarSesion,
            cambiarPassword,
            limpiarTokenCorrupto
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider };
export default AuthContext;