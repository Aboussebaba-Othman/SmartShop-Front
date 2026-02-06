import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '../../services/clientsService';
import FormField from '../../components/FormField';
import { AppContext } from '../../state/AppContext';

export default function NewClient() {
    const [nom, setNom] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const { pushNotification } = useContext(AppContext);
    const navigate = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSaving(true);

        try {
            await createClient({
                nom,
                email,
                username,
                password
            });
            pushNotification({ type: 'success', message: 'Client créé avec succès!' });
            navigate('/clients');
        } catch (err) {
            console.error(err);
            if (err.validation) {
                setErrors(err.validation);
            }
            pushNotification({ type: 'error', message: 'Erreur lors de la création du client' });
        } finally { setSaving(false); }
    };

    return (
        <div>
            <h1 style={{ marginBottom: '1.5rem' }}>Nouveau client</h1>

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

                    <FormField
                        label="Nom d'utilisateur"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required // Assuming required based on DTO
                        error={errors.username}
                        placeholder="login_client"
                    />

                    <FormField
                        label="Mot de passe"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        error={errors.password}
                        placeholder="••••••••"
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
