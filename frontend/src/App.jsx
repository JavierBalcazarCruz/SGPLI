import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { ItemsProvider } from './context/ItemsProvider';

// Layouts
import AuthLayout from './layout/AuthLayout';
import RutaProtegida from './layout/RutaProtegida';
import AdminLayout from './layout/AdminLayout';

// Páginas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Items from './pages/Items';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ItemsProvider>
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
                                {/* Aquí agregaremos más rutas conforme las vayamos creando */}
                            </Route>
                        </Route>
                    </Routes>
                </ItemsProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;