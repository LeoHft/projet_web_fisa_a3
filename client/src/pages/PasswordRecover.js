import React, { useState } from 'react';
import { windyBg, inputStyle, buttonStyle, recoveryBox, otpInputStyle } from '../styles/WindyStyle';

export default function PasswordRecoveryPage() {
    const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleOtpChange = (index, value) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        
        // Auto focus to next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleSendOtp = (e) => {
        e.preventDefault();
        // Send OTP logic here
        setStep(2);
    };

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        // Verify OTP logic here
        setStep(3);
    };

    const handleResetPassword = (e) => {
        e.preventDefault();
        // Reset password logic here
        if (newPassword !== confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        // Redirect to login or show success message
    };

    return (
        <div style={windyBg}>
            <form 
                style={recoveryBox} 
                onSubmit={
                    step === 1 ? handleSendOtp : 
                    step === 2 ? handleVerifyOtp : 
                    handleResetPassword
                }
            >
                <h2 style={{ fontFamily: 'Segoe UI, sans-serif', marginBottom: '1.5rem', color: '#66a6ff', letterSpacing: '2px' }}>
                    {step === 1 ? 'Reset Password' : step === 2 ? 'Enter OTP' : 'New Password'}
                </h2>

                {step === 1 && (
                    <>
                        <p style={{ color: '#666', textAlign: 'center', marginBottom: '1rem' }}>
                           Entrer votre adresse e-mail pour recevoir un code de réinitialisation
                        </p>
                        <input
                            style={inputStyle}
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </>
                )}

                {step === 2 && (
                    <>
                        <p style={{ color: '#666', textAlign: 'center', marginBottom: '1rem' }}>
                            Entrez le code à 6 chiffres envoyé à votre adresse e-mail
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-${index}`}
                                    style={otpInputStyle}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    pattern="[0-9]*"
                                    inputMode="numeric"
                                    required
                                />
                            ))}
                        </div>
                        <p style={{ color: '#66a6ff', fontSize: '0.9rem', cursor: 'pointer' }}>
                           Code non reçu ? <span style={{ fontWeight: 'bold' }}>Renvoyer</span>
                        </p>
                    </>
                )}

                {step === 3 && (
                    <>
                        <input
                            style={inputStyle}
                            type="password"
                            placeholder="Nouveau Mot de Passe"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <input
                            style={inputStyle}
                            type="password"
                            placeholder="Confirmer le Nouveau Mot de Passe"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </>
                )}

                <button style={buttonStyle} type="submit">
                    {step === 1 ? 'Envoyer le code' : step === 2 ? 'Vérifier le code' : 'Réinitialiser le mot de passe'}
                </button>

                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <a href="/login" style={{ color: '#66a6ff', textDecoration: 'none' }}>
                        Retour à la connexion
                    </a>
                </div>
            </form>
        </div>
    );
}