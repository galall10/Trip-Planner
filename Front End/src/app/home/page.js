import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Link from 'next/link';
import React from "react";

export default function Home() {
    return (
        <div className={styles.container}>
            <Head>
                <title></title>
                <meta name="description" content="Join tripster.com today" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <div className={styles.logoContainer}>
                    <img src="\logos\purb logo\top logo.png" alt="Logo"
                         className={styles.logo}/>
                </div>
                <div className={styles.buttonContainer}>
                    <Link href="/home/signin">
                        <button className={styles.createButton}>Sign in!</button>
                    </Link>
                </div>
                <br/>
                <p className={styles.signInText}>
                    Don't have an account? <a  href="/home/signup">Sign up</a>
                </p>
                <br/>
            </main>

            <footer className={styles.footer}>
                <p>Welcome to Tripster! </p>
            </footer>
        </div>
    );
}
