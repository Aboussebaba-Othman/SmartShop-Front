import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { fetchClients, deleteClient } from '../../services/clientsService';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import Dialog from '../../components/Dialog';
import { formatMoney } from '../../utils/money';
import { AppContext } from '../../state/AppContext';

export default function ClientsList() {
    const [allClients, setAllClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [displayedClients, setDisplayedClients] = useState([]);
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [q, setQ] = useState('');
    const [loading, setLoading] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, clientId: null });
    const { pushNotification } = useContext(AppContext);

    // Load all clients once
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await fetchClients();
                const data = Array.isArray(res) ? res : (res.content || []);
                data.sort((a, b) => b.id - a.id);
                setAllClients(data);
                setFilteredClients(data);
            } catch (err) {
                console.error(err);
                pushNotification({ type: 'error', message: 'Erreur lors du chargement des clients' });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Filter and paginate
    useEffect(() => {
        let filtered = allClients;
        if (q) {
            const lowerQ = q.toLowerCase();
            filtered = allClients.filter(client =>
                (client.nom && client.nom.toLowerCase().includes(lowerQ)) ||
                (client.email && client.email.toLowerCase().includes(lowerQ))
            );
        }
        setFilteredClients(filtered);
        setTotalPages(Math.ceil(filtered.length / perPage) || 1);

        // Paginate
        const start = (page - 1) * perPage;
        const end = start + perPage;
        setDisplayedClients(filtered.slice(start, end));
    }, [allClients, q, page, perPage]);

    // Reset page on search
    useEffect(() => {
        setPage(1);
    }, [q]);

    const handleDelete = async (id) => {
        try {
            await deleteClient(id);
            pushNotification({ type: 'success', message: 'Client supprimé avec succès' });
            // Reload
            const res = await fetchClients();
            const data = Array.isArray(res) ? res : (res.content || []);
            setAllClients(data);
        } catch (err) {
            pushNotification({ type: 'error', message: 'Erreur lors de la suppression' });
        }
    };

    const getTierBadge = (tier) => {
        const tierClass = `badge badge-${tier ? tier.toLowerCase() : 'basic'}`;
        return <span className={tierClass}>{tier || 'BASIC'}</span>;
    };

    const columns = [
        {
            key: 'nom', label: 'Nom', render: r => (
                <Link to={`/clients/${r.id}`} style={{ fontWeight: 'bold', color: 'var(--primary)', textDecoration: 'none' }}>
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
                <div style={{ display: 'flex', gap: '0.5rem', minWidth: '100px' }}>
                    <Link to={`/clients/${r.id}/edit`} className="btn btn-sm btn-info" style={{ color: 'white' }}>
                        Modifier
                    </Link>
                </div>
            )
        }
    ];

    return (
        <div className="container">
            <div className="page-header">
                <div className="page-title">
                    <h1>Clients</h1>
                    <p>Gérez votre base de clients</p>
                </div>
                <Link to="/clients/new" className="btn btn-primary">
                    <span>+</span> Nouveau client
                </Link>
            </div>

            <div className="card">
                <div className="toolbar">
                    <div className="search-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            className="input"
                            placeholder="Rechercher un client..."
                            value={q}
                            onChange={e => setQ(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-secondary" onClick={() => { /* automatic */ }}>
                        Rechercher
                    </button>
                </div>

                {loading ? (
                    <div className="loading-state">Chargement...</div>
                ) : (
                    <>
                        <div className="table-container">
                            <Table columns={columns} data={displayedClients} />
                        </div>
                        <Pagination page={page} totalPages={totalPages} onChange={p => setPage(p)} />
                    </>
                )}
            </div>

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
