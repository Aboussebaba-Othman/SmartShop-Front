import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../../services/productsService';
import FormField from '../../components/FormField';
import { AppContext } from '../../state/AppContext';

export default function NewProduct() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const { pushNotification } = useContext(AppContext);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);

    try {
      await createProduct({
        nom: name,
        prixUnitaire: Number(price),
        stock: Number(stock)
      });
      pushNotification({ type: 'success', message: 'Produit créé avec succès!' });
      navigate('/products');
    } catch (err) {
      console.error(err);
      if (err.validation) {
        setErrors(err.validation);
      }
      pushNotification({ type: 'error', message: 'Erreur lors de la création du produit' });
    } finally { setSaving(false); }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Nouveau produit</h1>

      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '600px',
      }}>
        <form onSubmit={submit}>
          <FormField
            label="Nom"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            error={errors.name}
            placeholder="Nom du produit"
          />

          <FormField
            label="Prix HT"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={e => setPrice(e.target.value)}
            required
            error={errors.price}
            placeholder="0.00"
          />

          <FormField
            label="Stock"
            type="number"
            min="0"
            value={stock}
            onChange={e => setStock(e.target.value)}
            required
            error={errors.stock}
            placeholder="0"
          />

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: saving ? '#95a5a6' : '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
              }}
            >
              {saving ? 'Création...' : 'Créer'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/products')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

