import { useContext } from 'react';
import { AppContext } from '../state/AppContext';

export default function Dashboard() {
    const { user } = useContext(AppContext);

    return (
        <div>
            <h1 style={{ marginBottom: '1.5rem' }}>Tableau de bord</h1>

            <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '1.5rem',
            }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
                    Bienvenue, {user?.name || 'Utilisateur'}!
                </h2>
                <p style={{ color: '#666' }}>
                    Rôle: <strong>{user?.role || 'N/A'}</strong>
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '0.5rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#666' }}>Produits</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>-</p>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '0.5rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#666' }}>Clients</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>-</p>
                </div>

                <div style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '0.5rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#666' }}>Commandes</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e74c3c' }}>-</p>
                </div>
            </div>
        </div>
    );
}
