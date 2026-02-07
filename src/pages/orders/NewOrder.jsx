import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../state/AppContext';
import { fetchClients } from '../../services/clientsService';
import { fetchProducts } from '../../services/productsService';
import { createOrder } from '../../services/ordersService';
import { formatMoney } from '../../utils/money';
import PromoCodeInput from '../../components/PromoCodeInput';

export default function NewOrder() {
    const navigate = useNavigate();
    const { pushNotification } = useContext(AppContext);

    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        clientId: '',
        promoCode: ''
    });

    const [cart, setCart] = useState([]);
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [promoValidating, setPromoValidating] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [clientsData, productsData] = await Promise.all([
                fetchClients(),
                fetchProducts()
            ]);
            setClients(Array.isArray(clientsData) ? clientsData : clientsData.content || []);
            setProducts(Array.isArray(productsData) ? productsData : []);
        } catch (err) {
            console.error(err);
            pushNotification({ type: 'error', message: 'Erreur lors du chargement des données' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = () => {
        setCart([...cart, { productId: '', quantity: 1 }]);
    };

    const handleRemoveProduct = (index) => {
        setCart(cart.filter((_, i) => i !== index));
    };

    const handleCartChange = (index, field, value) => {
        const newCart = [...cart];
        newCart[index][field] = value;
        setCart(newCart);

        // Clear error for this item
        if (errors[`cart_${index}`]) {
            const newErrors = { ...errors };
            delete newErrors[`cart_${index}`];
            setErrors(newErrors);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.clientId) {
            newErrors.clientId = 'Veuillez sélectionner un client';
        }

        if (cart.length === 0) {
            newErrors.cart = 'Veuillez ajouter au moins un produit';
        }

        cart.forEach((item, index) => {
            if (!item.productId) {
                newErrors[`cart_${index}`] = 'Veuillez sélectionner un produit';
            }
            if (!item.quantity || item.quantity <= 0) {
                newErrors[`cart_${index}`] = 'Quantité invalide';
            }

            // Check stock
            const product = products.find(p => p.id === parseInt(item.productId));
            if (product && item.quantity > product.stock) {
                newErrors[`cart_${index}`] = `Stock insuffisant (disponible: ${product.stock})`;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            pushNotification({ type: 'error', message: 'Veuillez corriger les erreurs' });
            return;
        }

        try {
            const payload = {
                clientId: parseInt(formData.clientId),
                promoCode: formData.promoCode || undefined,
                items: cart.map(item => ({
                    productId: parseInt(item.productId),
                    quantity: parseInt(item.quantity)
                }))
            };

            await createOrder(payload);
            pushNotification({ type: 'success', message: 'Commande créée avec succès' });
            navigate('/orders');
        } catch (err) {
            console.error(err);
            pushNotification({ type: 'error', message: err.response?.data?.message || 'Erreur lors de la création de la commande' });
        }
    };

    const getProduct = (productId) => {
        return products.find(p => p.id === parseInt(productId));
    };

    const calculateTotals = () => {
        let subtotal = 0;

        cart.forEach(item => {
            const product = getProduct(item.productId);
            if (product && item.quantity) {
                subtotal += product.prixUnitaire * item.quantity;
            }
        });

        const discount = (subtotal * promoDiscount) / 100;
        const afterDiscount = subtotal - discount;
        const tva = afterDiscount * 0.20;
        const total = afterDiscount + tva;

        return {
            subtotal,
            discount,
            tva,
            total
        };
    };

    const totals = calculateTotals();

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>;
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>Nouvelle Commande</h1>

            <form onSubmit={handleSubmit}>
                {/* Client Selection */}
                <div style={{ marginBottom: '2rem', backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem' }}>
                    <h3 style={{ marginTop: 0 }}>Client</h3>
                    <select
                        value={formData.clientId}
                        onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: errors.clientId ? '2px solid #e74c3c' : '1px solid #ddd',
                            borderRadius: '0.5rem',
                            fontSize: '1rem'
                        }}
                    >
                        <option value="">Sélectionner un client</option>
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>
                                {client.nom} - {client.email}
                            </option>
                        ))}
                    </select>
                    {errors.clientId && <p style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.5rem' }}>{errors.clientId}</p>}
                </div>

                {/* Products */}
                <div style={{ marginBottom: '2rem', backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0 }}>Produits</h3>
                        <button
                            type="button"
                            onClick={handleAddProduct}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#3498db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer'
                            }}
                        >
                            + Ajouter un produit
                        </button>
                    </div>

                    {errors.cart && <p style={{ color: '#e74c3c', fontSize: '0.875rem', marginBottom: '1rem' }}>{errors.cart}</p>}

                    {cart.map((item, index) => {
                        const product = getProduct(item.productId);
                        return (
                            <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                                <select
                                    value={item.productId}
                                    onChange={(e) => handleCartChange(index, 'productId', e.target.value)}
                                    style={{
                                        flex: 2,
                                        padding: '0.75rem',
                                        border: errors[`cart_${index}`] ? '2px solid #e74c3c' : '1px solid #ddd',
                                        borderRadius: '0.5rem'
                                    }}
                                >
                                    <option value="">Sélectionner un produit</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.nom} - {formatMoney(p.prixUnitaire)} (Stock: {p.stock})
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => handleCartChange(index, 'quantity', e.target.value)}
                                    placeholder="Quantité"
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        border: errors[`cart_${index}`] ? '2px solid #e74c3c' : '1px solid #ddd',
                                        borderRadius: '0.5rem'
                                    }}
                                />

                                {product && (
                                    <div style={{ flex: 1, padding: '0.75rem', fontWeight: '600' }}>
                                        {formatMoney(product.prixUnitaire * (item.quantity || 0))}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => handleRemoveProduct(index)}
                                    style={{
                                        padding: '0.75rem 1rem',
                                        backgroundColor: '#e74c3c',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Supprimer
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Promo Code Component */}
                <PromoCodeInput
                    discount={promoDiscount}
                    onApply={(promo) => {
                        if (promo) {
                            setFormData({ ...formData, promoCode: promo.code });
                            setPromoDiscount(promo.discountPercentage);
                            pushNotification({ type: 'success', message: `Code promo appliqué: ${promo.discountPercentage}% de réduction` });
                        } else {
                            // Error handling is inside component, just reset parent state
                            setFormData({ ...formData, promoCode: '' });
                            setPromoDiscount(0);
                        }
                    }}
                    onRemove={() => {
                        setFormData({ ...formData, promoCode: '' });
                        setPromoDiscount(0);
                        pushNotification({ type: 'info', message: 'Code promo retiré' });
                    }}
                />

                {/* Summary */}
                <div style={{ marginBottom: '2rem', backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem' }}>
                    <h3 style={{ marginTop: 0 }}>Récapitulatif</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Sous-total (HT):</span>
                        <span>{formatMoney(totals.subtotal)}</span>
                    </div>
                    {totals.discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#27ae60' }}>
                            <span>Remise promo ({promoDiscount}%):</span>
                            <span>-{formatMoney(totals.discount)}</span>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>TVA (20%):</span>
                        <span>{formatMoney(totals.tva)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '2px solid #ddd', fontWeight: '700', fontSize: '1.25rem' }}>
                        <span>Total (TTC):</span>
                        <span>{formatMoney(totals.total)}</span>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/orders')}
                        className="btn btn-secondary"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="btn btn-success"
                        style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}
                    >
                        Créer la commande
                    </button>
                </div>
            </form>
        </div>
    );
}
