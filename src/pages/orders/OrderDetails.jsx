import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../../state/AppContext';
import { fetchOrderById, confirmOrder, cancelOrder } from '../../services/ordersService';
import { fetchPaymentsByOrder, createPayment, updatePaymentStatus } from '../../services/paymentsService';
import { formatMoney } from '../../utils/money';
import Dialog from '../../components/Dialog';

export default function OrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, pushNotification } = useContext(AppContext);

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        paymentMethod: 'ESPECES',
        reference: '',
        bankName: ''
    });

    useEffect(() => {
        loadOrder();
    }, [id]);

    const loadOrder = async () => {
        setLoading(true);
        try {
            const data = await fetchOrderById(id);
            setOrder(data);
            // Set default payment amount to remaining
            const totalPaid = (data.payments || []).reduce((sum, p) => sum + p.amount, 0);
            const remaining = data.montantTotal - totalPaid;
            setPaymentForm(prev => ({ ...prev, amount: remaining.toFixed(2) }));
        } catch (err) {
            console.error(err);
            pushNotification({ type: 'error', message: 'Erreur lors du chargement de la commande' });
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmOrder = async () => {
        if (!window.confirm('Confirmer cette commande ? Elle doit être entièrement payée.')) return;

        try {
            await confirmOrder(id);
            pushNotification({ type: 'success', message: 'Commande confirmée avec succès' });
            loadOrder();
        } catch (err) {
            console.error(err);
            pushNotification({ type: 'error', message: err.response?.data?.message || 'Erreur lors de la confirmation' });
        }
    };

    const handleCancelOrder = async () => {
        if (!window.confirm('Annuler cette commande ?')) return;

        try {
            await cancelOrder(id);
            pushNotification({ type: 'success', message: 'Commande annulée avec succès' });
            loadOrder();
        } catch (err) {
            console.error(err);
            pushNotification({ type: 'error', message: 'Erreur lors de l\'annulation' });
        }
    };

    const handleAddPayment = async () => {
        try {
            const payload = {
                orderId: parseInt(id),
                amount: parseFloat(paymentForm.amount),
                paymentMethod: paymentForm.paymentMethod,
                reference: paymentForm.reference || undefined,
                bankName: paymentForm.bankName || undefined
            };

            console.log('Sending payment payload:', payload);

            await createPayment(payload);
            console.log('Payment created successfully');

            pushNotification({ type: 'success', message: 'Paiement ajouté avec succès' });
            setShowPaymentDialog(false);
            loadOrder();
        } catch (err) {
            console.error('Payment error:', err);
            console.error('Error response:', err.response);
            pushNotification({ type: 'error', message: err.response?.data?.message || 'Erreur lors de l\'ajout du paiement' });
        }
    };

    const handleUpdatePaymentStatus = async (paymentId, newStatus) => {
        if (!window.confirm(`Voulez-vous vraiment passer ce paiement au statut ${newStatus} ?`)) return;

        try {
            await updatePaymentStatus(paymentId, newStatus);
            pushNotification({ type: 'success', message: `Statut du paiement mis à jour : ${newStatus}` });
            loadOrder();
        } catch (err) {
            console.error(err);
            pushNotification({ type: 'error', message: err.response?.data?.message || 'Erreur lors de la mise à jour du paiement' });
        }
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            PENDING: '#f39c12',
            CONFIRMED: '#27ae60',
            REJECTED: '#e74c3c',
            CANCELLED: '#95a5a6',
            COMPLETED: '#27ae60',
            REJECTED_PAYMENT: '#e74c3c',
            ENCAISSE: '#27ae60'
        };

        return (
            <span style={{
                padding: '0.5rem 1rem',
                borderRadius: '1rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                backgroundColor: (statusColors[status] || '#95a5a6') + '20',
                color: statusColors[status] || '#95a5a6'
            }}>
                {status}
            </span>
        );
    };

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>;
    }

    if (!order) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Commande non trouvée</div>;
    }

    const totalPaid = (order.payments || []).reduce((sum, p) => sum + p.amount, 0);
    const remaining = order.totalTTC - totalPaid;
    const isFullyPaid = remaining <= 0.01;

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <Link to="/orders" style={{ color: '#3498db', textDecoration: 'none', marginBottom: '0.5rem', display: 'block' }}>
                        ← Retour aux commandes
                    </Link>
                    <h1 style={{ margin: 0 }}>Commande #{order.id}</h1>
                </div>
                {getStatusBadge(order.status)}
            </div>

            {/* Order Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem' }}>
                    <h3 style={{ marginTop: 0 }}>Informations</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div><strong>Client:</strong> {order.clientName}</div>
                        <div><strong>Date:</strong> {new Date(order.orderDate).toLocaleDateString('fr-FR')}</div>
                        {order.dateConfirmation && (
                            <div><strong>Confirmée le:</strong> {new Date(order.dateConfirmation).toLocaleDateString('fr-FR')}</div>
                        )}
                    </div>
                </div>

                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem' }}>
                    <h3 style={{ marginTop: 0 }}>Résumé Financier</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Sous-total (HT):</span>
                            <span>{formatMoney(order.subTotal)}</span>
                        </div>
                        {order.discountAmount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#27ae60' }}>
                                <span>Remise promo:</span>
                                <span>-{formatMoney(order.discountAmount)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>TVA (20%):</span>
                            <span>{formatMoney(order.tva)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '2px solid #ddd', fontWeight: '700', fontSize: '1.1rem' }}>
                            <span>Total (TTC):</span>
                            <span>{formatMoney(order.totalTTC)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Items */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
                <h3 style={{ marginTop: 0 }}>Articles</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                        <tr>
                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Produit</th>
                            <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Quantité</th>
                            <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Prix Unitaire</th>
                            <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(order.orderItems || []).map((item, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                                <td style={{ padding: '0.75rem' }}>{item.productName}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.quantity}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'right' }}>{formatMoney(item.unitPrice)}</td>
                                <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>
                                    {formatMoney(item.totalPrice)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Payments */}
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Paiements</h3>
                    {!isFullyPaid && order.status === 'PENDING' && (
                        <button
                            onClick={() => setShowPaymentDialog(true)}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#3498db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer'
                            }}
                        >
                            + Ajouter un paiement
                        </button>
                    )}
                </div>

                {(order.payments || []).length === 0 ? (
                    <p style={{ color: '#666', textAlign: 'center', padding: '1rem' }}>Aucun paiement enregistré</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f8f9fa' }}>
                            <tr>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Date</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Méthode</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Référence</th>
                                <th style={{ padding: '0.75rem', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Montant</th>
                                <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Statut</th>
                                {user?.role === 'ADMIN' && <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {order.payments.map((payment, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                                    <td style={{ padding: '0.75rem' }}>{new Date(payment.paymentDate).toLocaleDateString('fr-FR')}</td>
                                    <td style={{ padding: '0.75rem' }}>{payment.paymentMethod}</td>
                                    <td style={{ padding: '0.75rem' }}>{payment.reference || '-'}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>{formatMoney(payment.amount)}</td>
                                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{getStatusBadge(payment.status)}</td>
                                    {user?.role === 'ADMIN' && (
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                            {payment.status !== 'ENCAISSE' && payment.status !== 'REJETE' && (
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                    <button
                                                        onClick={() => handleUpdatePaymentStatus(payment.id, 'ENCAISSE')}
                                                        title="Encaisser"
                                                        style={{
                                                            padding: '0.25rem 0.5rem',
                                                            backgroundColor: '#27ae60',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '0.25rem',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdatePaymentStatus(payment.id, 'REJETE')}
                                                        title="Rejeter"
                                                        style={{
                                                            padding: '0.25rem 0.5rem',
                                                            backgroundColor: '#e74c3c',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '0.25rem',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Total payé:</span>
                        <span style={{ fontWeight: '600' }}>{formatMoney(totalPaid)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '700', color: remaining > 0 ? '#e74c3c' : '#27ae60' }}>
                        <span>Reste à payer:</span>
                        <span>{formatMoney(Math.max(0, remaining))}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            {order.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button
                        onClick={handleCancelOrder}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        Annuler la commande
                    </button>
                    {user?.role === 'ADMIN' && isFullyPaid && (
                        <button
                            onClick={handleConfirmOrder}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#27ae60',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            Confirmer la commande
                        </button>
                    )}
                </div>
            )}

            {/* Payment Dialog */}
            {showPaymentDialog && (
                <Dialog
                    isOpen={true}
                    title="Ajouter un paiement"
                    onClose={() => setShowPaymentDialog(false)}
                    onConfirm={handleAddPayment}
                    autoClose={false}
                    confirmText="Ajouter"
                    confirmColor="#3498db"
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Montant</label>
                            <input
                                type="number"
                                step="0.01"
                                value={paymentForm.amount}
                                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '0.5rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Méthode de paiement</label>
                            <select
                                value={paymentForm.paymentMethod}
                                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '0.5rem'
                                }}
                            >
                                <option value="ESPECES">Espèces</option>
                                <option value="CHEQUE">Chèque</option>
                                <option value="VIREMENT">Virement</option>
                            </select>
                        </div>

                        {(paymentForm.paymentMethod === 'CHEQUE' || paymentForm.paymentMethod === 'VIREMENT') && (
                            <>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Référence</label>
                                    <input
                                        type="text"
                                        value={paymentForm.reference}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                                        placeholder="Numéro de chèque ou référence virement"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #ddd',
                                            borderRadius: '0.5rem'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Banque</label>
                                    <input
                                        type="text"
                                        value={paymentForm.bankName}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, bankName: e.target.value })}
                                        placeholder="Nom de la banque"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #ddd',
                                            borderRadius: '0.5rem'
                                        }}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </Dialog>
            )}
        </div>
    );
}
