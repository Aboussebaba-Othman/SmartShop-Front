import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, deleteProduct } from '../../services/productsService';
import Table from '../../components/Table';
import Pagination from '../../components/Pagination';
import Dialog from '../../components/Dialog';
import { formatMoney } from '../../utils/money';
import { AppContext } from '../../state/AppContext';

export default function ProductsList() {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, productId: null });
  const { pushNotification } = useContext(AppContext);

  // Load all products once
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchProducts();
        const data = Array.isArray(res) ? res : (res.content || []);
        data.sort((a, b) => b.id - a.id);
        setAllProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        console.error(err);
        pushNotification({ type: 'error', message: 'Erreur lors du chargement des produits' });
      } finally { setLoading(false); }
    };
    load();
  }, []);

  // Filter and paginate whenever products, q, or page changes
  useEffect(() => {
    let filtered = allProducts;
    if (q) {
      const lowerQ = q.toLowerCase();
      filtered = allProducts.filter(p =>
        p.nom.toLowerCase().includes(lowerQ)
      );
    }
    setFilteredProducts(filtered);
    setTotalPages(Math.ceil(filtered.length / perPage) || 1);

    // Slice for pagination
    const start = (page - 1) * perPage;
    const end = start + perPage;
    setDisplayedProducts(filtered.slice(start, end));
  }, [allProducts, q, page, perPage]);

  // Reset page when search term changes
  useEffect(() => {
    setPage(1);
  }, [q]);

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      pushNotification({ type: 'success', message: 'Produit supprimé avec succès' });
      // Reload products
      const res = await fetchProducts();
      const data = Array.isArray(res) ? res : (res.content || []);
      setAllProducts(data);
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
        <div style={{ display: 'flex', gap: '0.5rem', minWidth: '140px' }}>
          <Link to={`/products/${r.id}/edit`} className="btn btn-sm btn-info" style={{ color: 'white' }}>
            Modifier
          </Link>
          <button
            onClick={() => setDeleteDialog({ isOpen: true, productId: r.id })}
            className="btn btn-sm btn-danger"
          >
            Supprimer
          </button>
        </div>
      )
    }
  ];
  return (
    <div className="container">
      <div className="page-header">
        <div className="page-title">
          <h1>Produits</h1>
          <p>Gérez votre catalogue de produits</p>
        </div>
        <Link to="/products/new" className="btn btn-primary">
          <span>+</span> Nouveau produit
        </Link>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              className="input"
              placeholder="Rechercher un produit..."
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
              <Table columns={columns} data={displayedProducts} />
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={p => setPage(p)} />
          </>
        )}
      </div>

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

