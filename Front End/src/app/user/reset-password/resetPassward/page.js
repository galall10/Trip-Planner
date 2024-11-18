"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation'
import styles from '../../styles/resetPassword.module.css';
import Image from 'next/image'; // Import Image from next/image


const ResetPasswordPage = () => {
    const router = useRouter();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const token = searchParams.get('token');


    const handleChange = (e) => {
        const { id, value } = e.target;
        if (id === 'newPassword') {
            setNewPassword(value);
        } else if (id === 'confirmPassword') {
            setConfirmPassword(value);
        }
        setError('');
        setMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/v1/auth/resetPassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, token, password: newPassword }),
            });

            if (response.ok) {
                setMessage('Password reset successfully. Redirecting to sign in page...');
                setTimeout(() => {
                    window.location.href = 'http://localhost:3000/home/signin';
                }, 3000); // Redirect after 3 seconds
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to reset password');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('An error occurred. Please try again later.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.logoContainer}>
                    <div className={styles.logoContainer}>
                    <img src="/logos/tripster-high-resolution-logo-white-transparent.png" alt="Logo"
                         className={styles.logo}/>
                    </div>
                </div>
            <main className={styles.main}>
            
                <h1>Reset Password</h1>
                <form className={styles.resetForm} onSubmit={handleSubmit}>
                    <label htmlFor="newPassword">New Password</label>
                    <input
                        type="password"
                        id="newPassword"
                        placeholder="Enter new password"
                        className={styles.inputField}
                        value={newPassword}
                        onChange={handleChange}
                        required
                    />
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        placeholder="Confirm new password"
                        className={styles.inputField}
                        value={confirmPassword}
                        onChange={handleChange}
                        required
                    />
                    {error && <p className={styles.error}>{error}</p>}
                    {message && <p className={styles.message}>{message}</p>}
                    <button type="submit" className={styles.resetButton}>Reset Password</button>
                </form>
            </main>
        </div>
    );
};

export default ResetPasswordPage;