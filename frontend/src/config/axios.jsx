import axios from "axios";

// Cliente Axios configurado para el backend del laboratorio
const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

const clienteAxios = axios.create({
    baseURL: `${backendURL}/api`
});

// Debug: Para verificar la URL en desarrollo
if (import.meta.env.DEV) {
    console.log('🔗 Backend URL configurada:', `${backendURL}/api`);
}

export default clienteAxios;