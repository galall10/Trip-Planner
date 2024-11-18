"use client";

import { useState } from 'react';
import Head from 'next/head';
import styles from '../../styles/signup.module.css';
import Image from 'next/image';
import Link from "next/link";

export default function Agency() {
    const [formData, setFormData] = useState({
        agencyName: '',
        email: '',
        password: '',
        phone: '',
        file: null,
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id]: value,
        });
    };

    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            file: e.target.files[0],
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('agencyName', formData.agencyName);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('phone', formData.phone);
        data.append('file', formData.file);

        try {
            const response = await fetch('/api/signup-agency', {
                method: 'POST',
                body: data,
            });
            if (response.ok) {
                // Redirect to the main page or show success message
                window.location.href = '/main';
            } else {
                // Handle error
                console.error('Failed to sign up');
            }
        } catch (error) {
            console.error('Error:', error);
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
                <div className={styles.logoContainer}>
                    <Image
                        src="/tripster-high-resolution-logo-white-transparent.png"
                        alt="Logo"
                        width={800}
                        height={200}
                        className={styles.logo}
                    />
                </div>
                <div className={styles.formContainer}>
                    <h1>Create an Account</h1>
                    <div className={styles.signupBox}>
                        <form className={styles.signupForm} onSubmit={handleSubmit}>
                            <div className={styles.verticalInputs}>
                                <label htmlFor="agencyName"></label>
                                <input
                                    type="text"
                                    id="agencyName"
                                    placeholder="Agency Name"
                                    className={styles.inputField}
                                    value={formData.agencyName}
                                    onChange={handleChange}
                                /><br />
                                <label htmlFor="email"></label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Email Address"
                                    className={styles.inputField}
                                    value={formData.email}
                                    onChange={handleChange}
                                /><br />
                                <label htmlFor="password"></label>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="Password"
                                    className={styles.inputField}
                                    value={formData.password}
                                    onChange={handleChange}
                                /><br />
                                <label htmlFor="phone"></label>
                                <input
                                    type="tel"
                                    id="phone"
                                    placeholder="Phone Number"
                                    className={styles.inputField}
                                    value={formData.phone}
                                    onChange={handleChange}
                                /><br />
                                <div className={styles.uploadContainer}>
                                    <div className={styles.uploadBox}>
                                        <p>Please upload all institution papers to be reviewed as pdf, e.g. Tax information, including tax identification number (TIN),
                                            The business's legal name,
                                            The business's registered street address,
                                            Documented proof of the business's incorporation or registration,
                                            Licensing documents relevant to the business's industry.</p>
                                        <label htmlFor="file" className={styles.uploadLabel}>
                                            <input
                                                type="file"
                                                id="file"
                                                name="file"
                                                accept="application/pdf"
                                                className={styles.uploadInput}
                                                onChange={handleFileChange}
                                            />
                                            <span className={styles.uploadButton}>Upload</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className={styles.signupButton}>Sign Up</button>
                        </form>
                        <p className={styles.signInText}>
                            Already have an account? <Link href="/home/signin">Sign in</Link>
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
