import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../state/AppContext';
import { fetchOrders } from '../services/ordersService';
import { fetchClients } from '../services/clientsService';
import { fetchProducts } from '../services/productsService';
import { formatMoney } from '../utils/money';

export default function Dashboard() {
    const { user } = useContext(AppContext);
    const [stats, setStats] = useState({
        revenue: 0,
        ordersCount: 0,
        clientsCount: 0,
        lowStockCount: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch all data in parallel
                const [ordersData, clientsData, productsData] = await Promise.all([
                    fetchOrders(),
                    fetchClients(),
                    fetchProducts()
                ]);

                // Process Orders
                const orders = Array.isArray(ordersData) ? ordersData : ordersData.content || [];
                // Calculate Total Revenue (only CONFIRMED orders or all? Let's take CONFIRMED + COMPLETED)
                const revenue = orders
                    .filter(o => o.status === 'CONFIRMED' || o.status === 'COMPLETED')
                    .reduce((sum, o) => sum + o.totalTTC, 0);

                // Process Clients
                const clients = Array.isArray(clientsData) ? clientsData : clientsData.content || [];

                // Process Products for Low Stock (e.g., < 10)
                const products = Array.isArray(productsData) ? productsData : productsData.content || [];
                const lowStock = products.filter(p => p.stock < 10 && !p.deleted).length;

                setStats({
                    revenue,
                    ordersCount: orders.length,
                    clientsCount: clients.length,
                    lowStockCount: lowStock
                });

                // Recent Orders (sort by date desc and take 5)
                const sortedOrders = [...orders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
                setRecentOrders(sortedOrders.slice(0, 5));

                // Calculate Top Products
                const productSales = {};
                orders.forEach(order => {
                    const items = order.orderItems || order.items || [];
                    items.forEach(item => {
                        const name = item.productName || item.productNom || 'Inconnu';
                        if (!productSales[name]) productSales[name] = 0;
                        productSales[name] += item.quantity;
                    });
                });

                const topProds = Object.entries(productSales)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3);

                setTopProducts(topProds);

            } catch (err) {
                console.error("Error loading dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    const getStatusBadge = (status) => {
        const statusColors = {
            PENDING: '#f39c12',
            CONFIRMED: '#27ae60',
            REJECTED: '#e74c3c',
            CANCELLED: '#95a5a6',
            COMPLETED: '#27ae60'
        };
        const statusLabels = {
            PENDING: 'En attente',
            CONFIRMED: 'Confirmée',
            REJECTED: 'Rejetée',
            CANCELLED: 'Annulée',
            COMPLETED: 'Terminée'
        };

        return (
            <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '1rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                backgroundColor: (statusColors[status] || '#95a5a6') + '20',
                color: statusColors[status] || '#95a5a6'
            }}>
                {statusLabels[status] || status}
            </span>
        );
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <div style={{ fontSize: '1.2rem', color: '#666' }}>Chargement du tableau de bord...</div>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#2c3e50' }}>
                    Bonjour, {user?.username || 'Admin'} 👋
                </h1>
                <p style={{ color: '#7f8c8d' }}>Voici ce qui se passe sur votre boutique aujourd'hui.</p>
            </div>

            {/* KPI Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
            }}>
                <KpiCard
                    title="Chiffre d'Affaires"
                    value={formatMoney(stats.revenue)}
                    icon="💰"
                    color="#27ae60"
                    trend="+12% vs mois dernier"
                />
                <KpiCard
                    title="Commandes"
                    value={stats.ordersCount}
                    icon="📦"
                    color="#3498db"
                    trend="+5 nouvelles ajd"
                />
                <KpiCard
                    title="Clients"
                    value={stats.clientsCount}
                    icon="👥"
                    color="#9b59b6"
                    trend="+2 cette semaine"
                />
                <KpiCard
                    title="Stock Faible"
                    value={stats.lowStockCount}
                    icon="⚠️"
                    color="#e67e22"
                    isAlert={stats.lowStockCount > 0}
                    trend="Produits à réapprovisionner"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Recent Orders */}
                <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#2c3e50' }}>Commandes Récentes</h3>
                        <Link to="/orders" style={{ color: '#3498db', textDecoration: 'none', fontWeight: '500', fontSize: '0.9rem' }}>
                            Voir tout →
                        </Link>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f1f2f6' }}>
                                <th style={{ textAlign: 'left', padding: '1rem', color: '#7f8c8d', fontSize: '0.85rem' }}>ID</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: '#7f8c8d', fontSize: '0.85rem' }}>Client</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: '#7f8c8d', fontSize: '0.85rem' }}>Date</th>
                                <th style={{ textAlign: 'right', padding: '1rem', color: '#7f8c8d', fontSize: '0.85rem' }}>Montant</th>
                                <th style={{ textAlign: 'center', padding: '1rem', color: '#7f8c8d', fontSize: '0.85rem' }}>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map(order => (
                                <tr key={order.id} style={{ borderBottom: '1px solid #f1f2f6' }}>
                                    <td style={{ padding: '1rem', fontWeight: '600', color: '#2c3e50' }}>#{order.id}</td>
                                    <td style={{ padding: '1rem', color: '#34495e' }}>{order.clientName}</td>
                                    <td style={{ padding: '1rem', color: '#7f8c8d' }}>{new Date(order.orderDate).toLocaleDateString('fr-FR')}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#2c3e50' }}>{formatMoney(order.totalTTC)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>{getStatusBadge(order.status)}</td>
                                </tr>
                            ))}
                            {recentOrders.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#95a5a6' }}>Aucune commande récente</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Quick Actions / Shortcuts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', color: '#2c3e50' }}>Actions Rapides</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <Link to="/orders/new" style={actionButtonStyle('#3498db')}>
                                <span style={{ marginRight: '0.5rem' }}>+</span> Nouvelle Commande
                            </Link>
                            <Link to="/products/new" style={actionButtonStyle('#27ae60')}>
                                <span style={{ marginRight: '0.5rem' }}>+</span> Nouveau Produit
                            </Link>
                            <Link to="/clients/new" style={actionButtonStyle('#8e44ad')}>
                                <span style={{ marginRight: '0.5rem' }}>+</span> Nouveau Client
                            </Link>
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                    }}>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', color: '#2c3e50' }}>🏆 Top Produits</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {topProducts.length === 0 ? (
                                <p style={{ color: '#95a5a6', fontSize: '0.9rem' }}>Pas encore de ventes</p>
                            ) : (
                                topProducts.map(([name, quantity], index) => (
                                    <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                backgroundColor: index === 0 ? '#f1c40f' : index === 1 ? '#bdc3c7' : '#e67e22',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {index + 1}
                                            </div>
                                            <span style={{ color: '#34495e', fontWeight: '500', fontSize: '0.9rem' }}>{name}</span>
                                        </div>
                                        <span style={{ fontWeight: '600', color: '#2c3e50' }}>{quantity} vtes</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KpiCard({ title, value, icon, color, trend, isAlert }) {
    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            borderLeft: `4px solid ${color}`
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                    <div style={{ color: '#7f8c8d', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {title}
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#2c3e50', marginTop: '0.25rem' }}>
                        {value}
                    </div>
                </div>
                <div style={{
                    backgroundColor: color + '20',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                }}>
                    {icon}
                </div>
            </div>
            {trend && (
                <div style={{
                    fontSize: '0.8rem',
                    color: isAlert ? '#e74c3c' : '#27ae60',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    {trend}
                </div>
            )}
        </div>
    );
}

const actionButtonStyle = (color) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    backgroundColor: color + '15', // 15% opacity
    color: color,
    textDecoration: 'none',
    borderRadius: '0.5rem',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    border: `1px solid ${color}30`
});
