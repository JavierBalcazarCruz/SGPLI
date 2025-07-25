import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { ItemsProvider } from './context/ItemsProvider';
import { PrestamosProvider } from './context/PrestamosProvider';
import { UsuariosProvider } from './context/UsuariosProvider';

// Layouts
import AuthLayout from './layout/AuthLayout';
import RutaProtegida from './layout/RutaProtegida';
import AdminLayout from './layout/AdminLayout';

// Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Items from './pages/Items';
import Prestamos from './pages/Prestamos';
import Devoluciones from './pages/Devoluciones';
import Usuarios from './pages/Usuarios';
import Perfil from './pages/Perfil';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ItemsProvider>
                    <PrestamosProvider>
                        <UsuariosProvider>
                            <Routes>
                                {/* Rutas públicas (autenticación) */}
                                <Route path="/" element={<AuthLayout />}>
                                    <Route index element={<Login />} />
                                </Route>

                                {/* Rutas privadas (admin) */}
                                <Route path="/admin" element={<RutaProtegida />}>
                                    <Route element={<AdminLayout />}>
                                        <Route index element={<Dashboard />} />
                                        <Route path="items" element={<Items />} />
                                        <Route path="prestamos" element={<Prestamos />} />
                                        <Route path="devoluciones" element={<Devoluciones />} />
                                        <Route path="usuarios" element={<Usuarios />} />
                                        <Route path="perfil" element={<Perfil />} />
                                        {/* Aquí agregaremos más rutas conforme las vayamos creando */}
                                    </Route>
                                </Route>
                            </Routes>
                        </UsuariosProvider>
                    </PrestamosProvider>
                </ItemsProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;