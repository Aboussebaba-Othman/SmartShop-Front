import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchClientById } from '../../services/clientsService';
import { fetchOrdersByClient } from '../../services/ordersService';
import { AppContext } from '../../state/AppContext';
import { formatMoney } from '../../utils/money';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';

export default function ClientDetails() {
    const { id } = useParams();
    const [client, setClient] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { pushNotification } = useContext(AppContext);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [clientData, ordersData] = await Promise.all([
                    fetchClientById(id),
                    fetchOrdersByClient(id, { page, size: 5 })
                ]);
                setClient(clientData);
                setOrders(ordersData.content || ordersData);
                setTotalPages(ordersData.totalPages || 1);
            } catch (err) {
                console.error(err);
                pushNotification({ type: 'error', message: 'Erreur lors du chargement des détails client' });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, page]);


    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>;
    if (!client) return <div style={{ padding: '2rem', textAlign: 'center' }}>Client introuvable</div>;

    const getTierBadge = (tier) => {
        const bgColors = {
            BASIC: '#ecf0f1',
            SILVER: '#bdc3c7',
            GOLD: '#f9e79f',
            PLATINUM: '#aab7b8'
        };
        return (
            <span style={{
                backgroundColor: bgColors[tier] || '#ecf0f1',
                color: '#2c3e50',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.875rem',
                fontWeight: 'bold',
            }}>
                {tier}
            </span>
        );
    };

    const orderColumns = [
        { key: 'id', label: 'N° Commande', render: r => <Link to={`/orders/${r.id}`}>#{r.id}</Link> },
        { key: 'date', label: 'Date', render: r => new Date(r.orderDate).toLocaleDateString() },
        { key: 'totalTTC', label: 'Total TTC', render: r => formatMoney(r.totalTTC) },
        { key: 'status', label: 'Statut', render: r => r.status }, // We can add badge later
        { key: 'paid', label: 'Payé', render: r => formatMoney(r.amountPaid) },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ margin: 0 }}>{client.nom}</h1>
                <Link
                    to={`/clients/${client.id}/edit`}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#3498db',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '0.25rem',
                    }}
                >
                    Modifier
                </Link>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Informations</h3>
                    <p><strong>Email:</strong> {client.email}</p>
                    <p><strong>Niveau de fidélité:</strong> {getTierBadge(client.tier)}</p>
                    <p><strong>Date d'inscription:</strong> {new Date(client.firstOrderDate).toLocaleDateString()}</p>
                </div>

                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Statistiques</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: '#666' }}>Total Commandes</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{client.totalOrders}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', color: '#666' }}>Total Dépensé</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#27ae60' }}>{formatMoney(client.totalSpent)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <h2 style={{ marginBottom: '1rem' }}>Historique des commandes</h2>
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', overflow: 'hidden' }}>
                <Table columns={orderColumns} data={orders} />
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
        </div>
    );
}
