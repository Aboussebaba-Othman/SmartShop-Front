import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../state/AppContext';
import { createPromoCode } from '../../services/promoCodesService';

export default function NewPromoCode() {
    const navigate = useNavigate();
    const { pushNotification } = useContext(AppContext);

    // Default dates: today and one month from now
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        code: '',
        discountPercentage: 10,
        startDate: today,
        endDate: nextMonthStr,
        usageLimit: 100
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createPromoCode({
                ...formData,
                code: formData.code.toUpperCase(),
                discountPercentage: parseFloat(formData.discountPercentage),
                usageLimit: parseInt(formData.usageLimit)
            });
            pushNotification({ type: 'success', message: 'Code promo créé avec succès' });
            navigate('/promo-codes');
        } catch (err) {
            console.error(err);
            pushNotification({ type: 'error', message: 'Erreur lors de la création' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="page-header">
                <div className="page-title">
                    <h1>Nouveau Code Promo</h1>
                    <p>Créez une nouvelle offre</p>
                </div>
            </div>

            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Code</label>
                        <input
                            type="text"
                            required
                            className="input"
                            value={formData.code}
                            onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            placeholder="Ex: SOLDES2024"
                            style={{ fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '1px' }}
                        />
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            Le code sera automatiquement converti en majuscules.
                        </p>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Réduction (%)</label>
                        <input
                            type="number"
                            required
                            min="1"
                            max="100"
                            className="input"
                            value={formData.discountPercentage}
                            onChange={e => setFormData({ ...formData, discountPercentage: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Date de début</label>
                            <input
                                type="date"
                                required
                                className="input"
                                value={formData.startDate}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Date de fin</label>
                            <input
                                type="date"
                                required
                                className="input"
                                value={formData.endDate}
                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Limite d'utilisation</label>
                        <input
                            type="number"
                            required
                            min="1"
                            className="input"
                            value={formData.usageLimit}
                            onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button type="button" onClick={() => navigate('/promo-codes')} className="btn btn-secondary">
                            Annuler
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Création...' : 'Créer le code promo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
