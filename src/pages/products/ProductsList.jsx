import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, deleteProduct } from '../../services/productsService';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import Dialog from '../../components/Dialog';
import { formatMoney } from '../../utils/money';
import { AppContext } from '../../state/AppContext';

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, productId: null });
  const { pushNotification } = useContext(AppContext);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, size: perPage };
      if (q) params.q = q;
      const res = await fetchProducts(params);
      setProducts(res.content || res);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
      pushNotification({ type: 'error', message: 'Erreur lors du chargement des produits' });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      pushNotification({ type: 'success', message: 'Produit supprimé avec succès' });
      load();
    } catch (err) {
      pushNotification({ type: 'error', message: 'Erreur lors de la suppression' });
    }
  };

  const columns = [
    { key: 'nom', label: 'Nom', render: r => r.nom },
    { key: 'prixUnitaire', label: 'Prix HT', render: r => formatMoney(r.prixUnitaire) },
    { key: 'stock', label: 'Stock', render: r => r.stock },
    {
      key: 'actions', label: 'Actions', render: r => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link
            to={`/products/${r.id}/edit`}
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
          <button
            onClick={() => setDeleteDialog({ isOpen: true, productId: r.id })}
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
        </div>
      )
    }
  ];

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Produits</h1>

      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        alignItems: 'center',
      }}>
        <input
          placeholder="Rechercher un produit..."
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
          to="/products/new"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#27ae60',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.25rem',
            fontSize: '1rem',
          }}
        >
          + Nouveau produit
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
          <Table columns={columns} data={products} />
          <Pagination page={page} totalPages={totalPages} onChange={p => setPage(p)} />
        </>
      )}

      <Dialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, productId: null })}
        onConfirm={() => handleDelete(deleteDialog.productId)}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
      />
    </div>
  );
}

