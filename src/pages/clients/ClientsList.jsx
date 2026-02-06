import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { fetchClients, deleteClient } from '../../services/clientsService';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import Dialog from '../../components/Dialog';
import { formatMoney } from '../../utils/money';
import { AppContext } from '../../state/AppContext';

export default function ClientsList() {
    const [clients, setClients] = useState([]);
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [q, setQ] = useState('');
    const [loading, setLoading] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, clientId: null });
    const { pushNotification } = useContext(AppContext);

    const load = async () => {
        setLoading(true);
        try {
            const params = { page, size: perPage };
            if (q) params.q = q;
            const res = await fetchClients(params);
            setClients(res.content || res);
            setTotalPages(res.totalPages || 1);
        } catch (err) {
            console.error(err);
            pushNotification({ type: 'error', message: 'Erreur lors du chargement des clients' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [page]);

    const handleDelete = async (id) => {
        try {
            await deleteClient(id);
            pushNotification({ type: 'success', message: 'Client supprimé avec succès' });
            load();
        } catch (err) {
            pushNotification({ type: 'error', message: 'Erreur lors de la suppression' });
        }
    };

    const getTierBadge = (tier) => {
        const colors = {
            BASIC: '#95a5a6',
            SILVER: '#7f8c8d',
            GOLD: '#f1c40f',
            PLATINUM: '#e5e4e2'
        };

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
                fontSize: '0.75rem',
                fontWeight: 'bold',
                border: `1px solid ${colors[tier] || '#bdc3c7'}`
            }}>
                {tier}
            </span>
        );
    };

    const columns = [
        {
            key: 'nom', label: 'Nom', render: r => (
                <Link to={`/clients/${r.id}`} style={{ fontWeight: 'bold', color: '#2c3e50', textDecoration: 'none' }}>
                    {r.nom}
                </Link>
            )
        },
        { key: 'email', label: 'Email', render: r => r.email },
        { key: 'tier', label: 'Fidélité', render: r => getTierBadge(r.tier) },
        { key: 'totalOrders', label: 'Commandes', render: r => r.totalOrders },
        { key: 'totalSpent', label: 'Total Dépensé', render: r => formatMoney(r.totalSpent) },
        {
            key: 'actions', label: 'Actions', render: r => (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link
                        to={`/clients/${r.id}/edit`}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#3498db',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '0.25rem',
                            fontSize: '0.875rem',
                        }}
                    >
                        Modifier
                    </Link>
                    {/* Only admins might want to delete clients - but let's keep it consistent */}
                    {/* 
        <button 
          onClick={() => setDeleteDialog({ isOpen: true, clientId: r.id })}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          Supprimer
        </button>
        */}
                </div>
            )
        }
    ];

    return (
        <div>
            <h1 style={{ marginBottom: '1.5rem' }}>Clients</h1>

            <div style={{
                display: 'flex',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                alignItems: 'center',
            }}>
                <input
                    placeholder="Rechercher un client..."
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '0.25rem',
                        fontSize: '1rem',
                    }}
                />
                <button
                    onClick={() => { setPage(1); load(); }}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        cursor: 'pointer',
                        fontSize: '1rem',
                    }}
                >
                    Rechercher
                </button>
                <Link
                    to="/clients/new"
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#27ae60',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '0.25rem',
                        fontSize: '1rem',
                    }}
                >
                    + Nouveau client
                </Link>
            </div>

            {loading ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                }}>
                    Chargement...
                </div>
            ) : (
                <>
                    <Table columns={columns} data={clients} />
                    <Pagination page={page} totalPages={totalPages} onChange={p => setPage(p)} />
                </>
            )}

            <Dialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, clientId: null })}
                onConfirm={() => handleDelete(deleteDialog.clientId)}
                title="Confirmer la suppression"
                message="Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible."
                confirmText="Supprimer"
                cancelText="Annuler"
            />
        </div>
    );
}
