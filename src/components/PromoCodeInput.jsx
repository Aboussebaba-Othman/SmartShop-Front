import { useState, useEffect } from 'react';
import { fetchPromoCodeByCode, fetchPromoCodes } from '../services/promoCodesService';

export default function PromoCodeInput({ onApply, onRemove, discount, disabled }) {
    const [code, setCode] = useState('');
    const [availableCodes, setAvailableCodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingCodes, setFetchingCodes] = useState(true);
    const [error, setError] = useState(null);

    // Fetch active promo codes on mount
    useEffect(() => {
        const loadCodes = async () => {
            try {
                const res = await fetchPromoCodes();
                const data = Array.isArray(res) ? res : res.content || [];
                const now = new Date();
                const activeCodes = data.filter(c => {
                    if (!c.active) return false;
                    const end = new Date(c.endDate);
                    return end >= now;
                });
                setAvailableCodes(activeCodes);
            } catch (err) {
                console.error("Failed to fetch promo codes", err);
            } finally {
                setFetchingCodes(false);
            }
        };
        loadCodes();
    }, []);

    const handleApply = async () => {
        if (!code) return;

        setLoading(true);
        setError(null);

        try {
            // Even though we select from a list, we still verify it against the backend validation
            const promo = await fetchPromoCodeByCode(code);
            if (promo && promo.active) {
                onApply(promo);
            } else {
                setError('Code promo invalide ou expiré');
                onApply(null);
            }
        } catch (err) {
            setError('Code promo introuvable');
            onApply(null);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleApply();
        }
    };

    const handleRemove = () => {
        setError(null);
        onRemove();
    };

    return (
        <div style={{ marginBottom: '2rem', backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem' }}>
            <h3 style={{ marginTop: 0 }}>Code Promo</h3>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ position: 'relative' }}>
                        <select
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            disabled={disabled || discount > 0 || fetchingCodes}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: error ? '2px solid #e74c3c' : discount > 0 ? '2px solid #27ae60' : '1px solid #ddd',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                backgroundColor: disabled ? '#f9f9f9' : 'white',
                                cursor: disabled ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <option value="">Sélectionner un code promo</option>
                            {availableCodes.map(promo => (
                                <option key={promo.id} value={promo.code}>
                                    {promo.code} (-{promo.discountPercentage}%)
                                </option>
                            ))}
                        </select>

                        {fetchingCodes && (
                            <span style={{ position: 'absolute', right: '30px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: '#666' }}>
                                Chargement...
                            </span>
                        )}

                        {discount > 0 && (
                            <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#27ae60', fontSize: '1.2rem' }}>✓</span>
                        )}
                    </div>
                    {error && <p style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>}
                </div>

                {discount > 0 ? (
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="btn btn-danger"
                        style={{ padding: '0.75rem 1.5rem' }}
                    >
                        Retirer
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleApply}
                        className="btn btn-primary"
                        disabled={!code || loading || disabled}
                        style={{ padding: '0.75rem 1.5rem', minWidth: '120px' }}
                    >
                        {loading ? '...' : 'Appliquer'}
                    </button>
                )}
            </div>

            {discount > 0 && (
                <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: '#eafaf1',
                    border: '1px solid #27ae60',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <span style={{ fontSize: '1.5rem' }}>🎉</span>
                    <div>
                        <div style={{ fontWeight: 'bold', color: '#27ae60' }}>Code promo appliqué !</div>
                        <div style={{ fontSize: '0.9rem', color: '#2c3e50' }}>Vous bénéficiez de <span style={{ fontWeight: 'bold' }}>{discount}% de réduction</span> sur votre commande.</div>
                    </div>
                </div>
            )}
        </div>
    );
}
