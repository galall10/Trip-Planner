"use client";
import { useState } from 'react';
import Head from 'next/head';
import styles from '../../styles/signup.module.css';
import Image from 'next/image';
import Link from "next/link";

export default function SignUp() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id]: value,
        });
    };

    const handleGenderChange = (e) => {
        setFormData({
            ...formData,
            gender: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/v1/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                // Redirect to the main page or show success message
                window.location.href = 'http://localhost:3000/home/signin';
            } else {
                const data = await response.json();
                if (data.err && data.err.driver && data.err.name === 'MongoError' && data.err.code === 11000) {
                    setError('Username already taken. Please choose a different username.');
                } else if (data.err && data.err.name === 'ValidationError') {
                    let errorMessage = '';
                    if (data.err.errors.password) {
                        errorMessage += data.err.errors.password.message + ' ';
                    }
                    if (data.err.errors.phoneNumber) {
                        errorMessage += data.err.errors.phoneNumber.message;
                    }
                    setError(errorMessage);
                } else {
                    setError('Failed to sign up. Please try again later.');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to sign up. Please try again later.');
        }
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>Sign Up - Tripster</title>
                <meta name="description" content="Sign up for tripster.com" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <div className={styles.splitContainer}>
                    <div className={styles.left}>
                        <h1>Create an Account</h1>
                        <form className={styles.signupForm} onSubmit={handleSubmit}>
                            <div className={styles.verticalInputs}>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="firstName">First Name</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        placeholder="First Name"
                                        className={styles.inputField}
                                        value={formData.firstName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="lastName">Last Name</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        placeholder="Last Name"
                                        className={styles.inputField}
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="email">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="Email Address"
                                        className={styles.inputField}
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="username">User Name</label>
                                    <input
                                        type="text"
                                        id="username"
                                        placeholder="User Name"
                                        className={styles.inputField}
                                        value={formData.username}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="password">Password</label>
                                    <input
                                        type="password"
                                        id="password"
                                        placeholder="Password"
                                        className={styles.inputField}
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="phoneNumber">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        placeholder="Phone Number"
                                        className={styles.inputField}
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="dateOfBirth">Date of Birth</label>
                                    <input
                                        type="date"
                                        id="dateOfBirth"
                                        placeholder="Date of Birth"
                                        className={styles.inputField}
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className={styles.genderOptions}>
                                    <label>
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="Male"
                                            className={styles.radio}
                                            checked={formData.gender === 'Male'}
                                            onChange={handleGenderChange}
                                        /> Male
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="Female"
                                            className={styles.radio}
                                            checked={formData.gender === 'Female'}
                                            onChange={handleGenderChange}
                                        /> Female
                                    </label>
                                </div>
                            </div>
                            {error && <p className={styles.error}>{error}</p>}
                            <div className={styles.signupButtonContainer}>
                                <button type="submit" className={styles.signupButton}>Sign Up</button>
                            </div>
                        </form>
                    </div>

                    <div className={styles.right}>
                        <div className={styles.logoContainer}>
                            <Image
                                src="/logos/purb logo/top logo.png"
                                alt="Logo"
                                width={800}
                                height={200}
                                className={styles.logo}
                            />
                        </div>
                        <p className={styles.signInText}>
                            Already have an account? <Link href="/home/signin">Sign in</Link>
                        </p>
                        <footer className={styles.footer}>
                            <p>Welcome to tripster.com!</p>
                        </footer>
                    </div>
                </div>
            </main>

        </div>
    );
}
