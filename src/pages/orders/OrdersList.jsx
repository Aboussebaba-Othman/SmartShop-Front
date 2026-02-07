import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../state/AppContext';
import { fetchOrders, fetchOrdersByClient, fetchOrdersByStatus, cancelOrder } from '../../services/ordersService';
import { fetchClients } from '../../services/clientsService';
import { formatMoney } from '../../utils/money';

export default function OrdersList() {
    const { user, pushNotification } = useContext(AppContext);
    const [orders, setOrders] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        clientId: ''
    });

    useEffect(() => {
        loadOrders();
        if (user?.role === 'ADMIN') {
            loadClients();
        }
    }, [filters]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            let data;
            if (user?.role === 'CLIENT') {
                // Client sees only their orders
                data = await fetchOrdersByClient(user.clientId);
            } else if (filters.status) {
                data = await fetchOrdersByStatus(filters.status);
            } else if (filters.clientId) {
                data = await fetchOrdersByClient(filters.clientId);
            } else {
                data = await fetchOrders();
            }
            const list = Array.isArray(data) ? data : data.content || [];
            // Sort newest first
            list.sort((a, b) => b.id - a.id);
            setOrders(list);
        } catch (err) {
            console.error(err);
            pushNotification({ type: 'error', message: 'Erreur lors du chargement des commandes' });
        } finally {
            setLoading(false);
        }
    };

    const loadClients = async () => {
        try {
            const data = await fetchClients();
            setClients(Array.isArray(data) ? data : data.content || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;

        try {
            await cancelOrder(orderId);
            pushNotification({ type: 'success', message: 'Commande annulée avec succès' });
            loadOrders();
        } catch (err) {
            console.error(err);
            pushNotification({ type: 'error', message: 'Erreur lors de l\'annulation de la commande' });
        }
    };

    const getStatusBadge = (status) => {
        return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>;
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>;
    }
    return (
        <div className="container">
            <div className="page-header">
                <div className="page-title">
                    <h1>Commandes</h1>
                    <p>Suivez et gérez vos commandes</p>
                </div>
                <Link to="/orders/new" className="btn btn-primary">
                    <span>+</span> Nouvelle Commande
                </Link>
            </div>

            <div className="card">
                {/* Filters */}
                <div className="toolbar">
                    <select
                        className="select"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="">Tous les statuts</option>
                        <option value="PENDING">En attente</option>
                        <option value="CONFIRMED">Confirmée</option>
                        <option value="REJECTED">Rejetée</option>
                        <option value="CANCELED">Annulée</option>
                    </select>

                    {user?.role === 'ADMIN' && (
                        <select
                            className="select"
                            value={filters.clientId}
                            onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
                        >
                            <option value="">Tous les clients</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.nom}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Orders Table */}
                {loading ? (
                    <div className="loading-state">Chargement...</div>
                ) : orders.length === 0 ? (
                    <div className="empty-state">Aucune commande trouvée</div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Client</th>
                                    <th>Date</th>
                                    <th style={{ textAlign: 'right' }}>Montant TTC</th>
                                    <th style={{ textAlign: 'center' }}>Statut</th>
                                    <th style={{ textAlign: 'center', width: '150px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id}>
                                        <td style={{ fontWeight: 'bold' }}>#{order.id}</td>
                                        <td>{order.clientName}</td>
                                        <td>{new Date(order.orderDate).toLocaleDateString('fr-FR')}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatMoney(order.totalTTC)}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            {getStatusBadge(order.status === 'CANCELLED' ? 'CANCELED' : order.status)}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', minWidth: '140px' }}>
                                                <Link to={`/orders/${order.id}`} className="btn btn-sm btn-info" style={{ color: 'white' }}>
                                                    Détails
                                                </Link>
                                                {order.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleCancelOrder(order.id)}
                                                        className="btn btn-sm btn-danger"
                                                    >
                                                        Annuler
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
