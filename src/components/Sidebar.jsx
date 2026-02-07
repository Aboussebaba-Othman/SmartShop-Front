import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../state/AppContext';
import { logout } from '../services/authService';


export default function Sidebar() {
    const location = useLocation();
    const { user, setUser } = useContext(AppContext);

    const handleLogout = async () => {
        await logout();
        setUser(null);
    };

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/products', label: 'Produits', icon: '📦' },
        { path: '/clients', label: 'Clients', icon: '👥' },
        { path: '/orders', label: 'Commandes', icon: '🛒' },
        { path: '/promo-codes', label: 'Codes Promo', icon: '🎟️' },
    ];

    // Filter menu items based on role
    const visibleItems = user?.role === 'CLIENT'
        ? menuItems.filter(item => item.path === '/dashboard' || item.path === '/orders')
        : menuItems;

    return (
        <aside style={{
            width: '250px',
            backgroundColor: '#2c3e50',
            color: 'white',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto'
        }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', margin: 0 }}>SmartShop</h1>
                {user && (
                    <p style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.5rem' }}>
                        {user.username} ({user.role})
                    </p>
                )}
            </div>

            <nav style={{ flex: 1 }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {visibleItems.map(item => (
                        <li key={item.path} style={{ marginBottom: '0.5rem' }}>
                            <Link
                                to={item.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.5rem',
                                    textDecoration: 'none',
                                    color: 'white',
                                    backgroundColor: isActive(item.path) ? '#34495e' : 'transparent',
                                    transition: 'background-color 0.2s',
                                }}
                            >
                                <span style={{ marginRight: '0.75rem' }}>{item.icon}</span>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <button
                onClick={handleLogout}
                style={{
                    padding: '0.75rem',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '1rem',
                }}
            >
                Déconnexion
            </button>
        </aside>
    );
}
