import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
    return (
        <main className="min-vh-100 d-flex align-items-center bg-light">
            <div className="container">
                <Outlet />
            </div>
        </main>
    );
};

export default AuthLayout;