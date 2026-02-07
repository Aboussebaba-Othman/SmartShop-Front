import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../state/AppContext';
import { fetchPromoCodes, deactivatePromoCode } from '../../services/promoCodesService';
import Table from '../../components/Table';

export default function PromoCodesList() {
    const [promoCodes, setPromoCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const { pushNotification } = useContext(AppContext);

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetchPromoCodes();
            const data = Array.isArray(res) ? res : res.content || [];
            const sorted = data.sort((a, b) => {
                if (b.active !== a.active) return b.active ? 1 : -1;
                return b.id - a.id;
            });
            setPromoCodes(sorted);
        } catch (err) {
            console.error(err);
            pushNotification({ type: 'error', message: 'Erreur lors du chargement des codes promo' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleDeactivate = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir désactiver ce code promo ?')) return;

        try {
            await deactivatePromoCode(id);
            pushNotification({ type: 'success', message: 'Code promo désactivé' });
            load();
        } catch (err) {
            pushNotification({ type: 'error', message: 'Erreur lors de la désactivation' });
        }
    };

    const columns = [
        {
            key: 'code',
            label: 'Code',
            render: r => (
                <span style={{
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    color: r.active ? 'var(--primary)' : 'var(--text-muted)',
                    backgroundColor: 'var(--background)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '0.25rem'
                }}>
                    {r.code}
                </span>
            )
        },
        {
            key: 'discount',
            label: 'Réduction',
            render: r => <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>{r.discountPercentage}%</span>
        },
        {
            key: 'dates',
            label: 'Validité',
            render: r => (
                <div style={{ fontSize: '0.875rem' }}>
                    <div>Du: {new Date(r.startDate).toLocaleDateString()}</div>
                    <div>Au: {new Date(r.endDate).toLocaleDateString()}</div>
                </div>
            )
        },
        { key: 'usage', label: 'Utilisations', render: r => `${r.currentUsage || 0} / ${r.usageLimit}` },
        {
            key: 'status',
            label: 'Statut',
            render: r => {
                const isExpired = new Date(r.endDate) < new Date();
                let status = 'ACTIF';
                let badgeClass = 'success';

                if (!r.active) {
                    status = 'INACTIF';
                    badgeClass = 'danger';
                } else if (isExpired) {
                    status = 'EXPIRÉ';
                    badgeClass = 'warning';
                }

                return (
                    <span className={`badge badge-${badgeClass}`}>
                        {status}
                    </span>
                );
            }
        },
        {
            key: 'actions',
            label: 'Actions',
            render: r => r.active && (
                <button
                    onClick={() => handleDeactivate(r.id)}
                    className="btn btn-sm btn-danger"
                >
                    Désactiver
                </button>
            )
        }
    ];

    if (loading) return <div className="loading-state">Chargement...</div>;

    return (
        <div className="container">
            <div className="page-header">
                <div className="page-title">
                    <h1>Codes Promo</h1>
                    <p>Gérez vos offres promotionnelles</p>
                </div>
                <Link to="/promo-codes/new" className="btn btn-primary">
                    + Nouveau Code
                </Link>
            </div>

            {promoCodes.length === 0 ? (
                <div className="empty-state">Aucun code promo trouvé</div>
            ) : (
                <div className="card">
                    <div className="table-container">
                        <Table columns={columns} data={promoCodes} />
                    </div>
                </div>
            )}
        </div>
    );
}
