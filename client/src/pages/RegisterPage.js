import React, { useState } from 'react';
import { windyBg, registerBox, inputStyle, buttonStyle } from '../styles/WindyStyle';
import { register } from '../api/modules/users';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthAttributes } from "../context/AuthAttributsContext";


export default function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const authContext = useAuthAttributes();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = e => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            toast.error('Les mots de passes ne correspondent pas !', { position: 'top-center', duration: 3000 });
            return;
        }
        
        register(formData)
            .then(response => {
                toast.success(response.message, { position: 'top-center', duration: 3000 });
                if (response.token) {
                    localStorage.setItem('token', response.token);
                }
                authContext.FetchUserAttributes(); // On recharge les attributs de l'utilisateur à la place de recharger la page
                navigate('/');
            })
            .catch(error => {
                toast.error(error.message, { position: 'top-center', duration: 3000 });
            });
    };

    return (
        <div style={windyBg}>
            <form style={registerBox} onSubmit={handleSubmit}>
                <h2 style={{ fontFamily: 'Segoe UI, sans-serif', marginBottom: '1.5rem', color: '#66a6ff', letterSpacing: '2px' }}>
                    Créer un compte
                </h2>
                
                <input
                    style={inputStyle}
                    type="text"
                    name="username"
                    placeholder="Nom d'utilisateur"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                
                <input
                    style={inputStyle}
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                
                <input
                    style={inputStyle}
                    type="password"
                    name="password"
                    placeholder="Mot de passe"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                
                <input
                    style={inputStyle}
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirmer le mot de passe"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                />
                
                <button style={buttonStyle} type="submit">
                    Créer un compte
                </button>

                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                        Vous avez déjà un compte ?{' '}
                        <a href="/login" style={{ color: '#66a6ff', textDecoration: 'none' }}>
                            Se connecter
                        </a>
                    </p>
                </div>
            </form>
        </div>
    );
}