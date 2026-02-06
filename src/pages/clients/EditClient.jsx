import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchClientById, updateClient } from '../../services/clientsService';
import FormField from '../../components/FormField';
import { AppContext } from '../../state/AppContext';

export default function EditClient() {
    const { id } = useParams();
    const [nom, setNom] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const { pushNotification } = useContext(AppContext);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const client = await fetchClientById(id);
                setNom(client.nom);
                setEmail(client.email);
            } catch (err) {
                pushNotification({ type: 'error', message: 'Erreur lors du chargement du client' });
                navigate('/clients');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const submit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSaving(true);

        try {
            await updateClient(id, {
                nom,
                email
            });
            pushNotification({ type: 'success', message: 'Client modifié avec succès!' });
            navigate('/clients');
        } catch (err) {
            console.error(err);
            if (err.validation) {
                setErrors(err.validation);
            }
            pushNotification({ type: 'error', message: 'Erreur lors de la modification du client' });
        } finally { setSaving(false); }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                Chargement...
            </div>
        );
    }

    return (
        <div>
            <h1 style={{ marginBottom: '1.5rem' }}>Modifier le client</h1>

            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '0.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                maxWidth: '600px',
            }}>
                <form onSubmit={submit}>
                    <FormField
                        label="Nom complet / Entreprise"
                        value={nom}
                        onChange={e => setNom(e.target.value)}
                        required
                        error={errors.nom}
                        placeholder="Nom du client"
                    />

                    <FormField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        error={errors.email}
                        placeholder="client@exemple.com"
                    />

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: saving ? '#95a5a6' : '#3498db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.25rem',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                fontSize: '1rem',
                            }}
                        >
                            {saving ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/clients')}
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
