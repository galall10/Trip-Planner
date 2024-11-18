"use client";

import { useState } from 'react';
import Head from 'next/head';
import styles from '../../styles/signin.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function Signin() {
    const [formData, setFormData] = useState({
        usernameOrEmail: '',
        password: '',
        type: 'Normal'
    });

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id]: value,
        });
        setError(''); // Clear error message when the user starts typing
        setMessage(''); // Clear message when the user starts typing
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.usernameOrEmail || !formData.password) {
            setError('Please fill in both fields');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                // Save the token and user data in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                // Redirect to the main page or show success message
                window.location.href = 'http://localhost:3000/main';
            } else {
                // Handle incorrect credentials
                const errorData = await response.json();
                setError(errorData.message || 'Incorrect username or password');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('An error occurred. Please try again later.');
        }
    };

    const handleForgotPassword = async () => {
        const email = formData.usernameOrEmail;

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/v1/auth/forgetPassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setMessage('An email with password reset instructions has been sent to your email address.');
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to send password reset email');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('An error occurred. Please try again later.');
        }
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>Sign in - Tripster</title>
                <meta name="description" content="Sign up for tripster.com" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <div className={styles.logoContainer}>
                    <Image
                        src="/logos/purb logo/top logo.png"
                        alt="Logo"
                        width={800} // Set width and height as per your design
                        height={200}
                        className={styles.logo}
                    />
                </div>
                <div className={styles.formContainer}>
                    <h2>Login</h2>
                    <div className={styles.signupBox}>
                        <form className={styles.signupForm} onSubmit={handleSubmit}>
                            <div className={styles.verticalInputs}>
                                <label htmlFor="usernameOrEmail"></label>
                                <input
                                    type="text"
                                    id="usernameOrEmail"
                                    placeholder="Username or Email Address"
                                    className={styles.inputField}
                                    value={formData.usernameOrEmail}
                                    onChange={handleChange}
                                /><br/>
                                <label htmlFor="password"></label>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="Password"
                                    className={styles.inputField}
                                    value={formData.password}
                                    onChange={handleChange}
                                /><br/>
                            </div>
                            {error && <p className={styles.error}>{error}</p>}
                            {message && <p className={styles.message}>{message}</p>}
                            <button type="submit" className={styles.signupButton}>Sign in</button>
                        </form>
                        <p className={styles.signInText}>
                            You do not have an account? <Link href="/home/signup">Sign up</Link>
                        </p>
                        <p className={styles.signInText}>
                            <button className={styles.forgotPasswordButton} onClick={handleForgotPassword}>Forgot Password?</button>
                        </p>
                    </div>
                </div>
            </main>

            <footer className={styles.footer}>
                <p>Welcome to tripster.com!</p>
            </footer>
        </div>
    );
}
