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
        const tierClass = `badge badge-${tier ? tier.toLowerCase() : 'basic'}`;
        return <span className={tierClass}>{tier || 'BASIC'}</span>;
    };

    const orderColumns = [
        {
            key: 'id',
            label: 'N° Commande',
            render: r => <Link to={`/orders/${r.id}`} style={{ fontWeight: 'bold', color: 'var(--primary)' }}>#{r.id}</Link>
        },
        { key: 'date', label: 'Date', render: r => new Date(r.orderDate).toLocaleDateString() },
        {
            key: 'totalTTC',
            label: 'Total TTC',
            render: r => <span style={{ fontWeight: 'bold' }}>{formatMoney(r.totalTTC)}</span>
        },
        {
            key: 'status',
            label: 'Statut',
            render: r => <span className={`badge badge-${r.status.toLowerCase()}`}>{r.status}</span>
        },
        { key: 'paid', label: 'Payé', render: r => formatMoney(r.amountPaid) },
    ];

    return (
        <div className="container">
            <div className="page-header">
                <div className="page-title">
                    <h1>{client.nom}</h1>
                    <p>Détails du client #{client.id}</p>
                </div>
                <Link to={`/clients/${client.id}/edit`} className="btn btn-primary">
                    Modifier
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <div className="card" style={{ marginBottom: 0 }}>
                    <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Informations</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                            <span style={{ fontWeight: '500' }}>{client.email}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Niveau de fidélité:</span>
                            {getTierBadge(client.tier)}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Date d'inscription:</span>
                            <span>{new Date(client.firstOrderDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ marginBottom: 0 }}>
                    <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Statistiques</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ padding: '1rem', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Commandes</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{client.totalOrders}</div>
                        </div>
                        <div style={{ padding: '1rem', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Dépensé</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>{formatMoney(client.totalSpent)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1.5rem' }}>Historique des commandes</h3>
                <div className="table-container">
                    <Table columns={orderColumns} data={orders} />
                </div>
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
        </div>
    );
}
