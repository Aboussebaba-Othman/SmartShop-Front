import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../state/AppContext';

export default function ProtectedRoute({ children, requiredRole }) {
    const { user, loading } = useContext(AppContext);

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user && user.role !== requiredRole) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
