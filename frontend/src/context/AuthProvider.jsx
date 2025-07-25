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
                setAuth({});
                localStorage.removeItem('lab_token');
                console.log(error.response?.data?.msg);
            }
            
            setCargando(false);
        };

        autenticarUsuario();
    }, []);

    const cerrarSesion = () => {
        localStorage.removeItem('lab_token');
        setAuth({});
    };

    const cambiarPassword = async (datos) => {
        const token = localStorage.getItem('lab_token');
        if (!token) return { error: true, msg: 'No autorizado' };

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

    return (
        <AuthContext.Provider value={{
            auth,
            setAuth,
            cargando,
            cerrarSesion,
            cambiarPassword
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider };
export default AuthContext;