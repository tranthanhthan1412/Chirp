import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthstore';
import { Outlet, Navigate } from 'react-router';

const ProtectedRoute = () => {
    const { accessToken, user, loading, fetchMe, refresh } = useAuthStore();
    const [starting, setStarting] = useState(true);

    const init = async () => {
        // co the xay ra khi refresh trang
        if (!accessToken) {
            await refresh();
        }
        if (accessToken && !user) {
            await fetchMe();
        }
        setStarting(false);
    };

    useEffect(() => {
        init()
    }, []);

    // them loading
    if (starting || loading) {
        return <div className='flex min-h-screen items-center justify-center'>Loading...</div>;
    }

    if (!accessToken) {
        return <Navigate to="/signin" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;