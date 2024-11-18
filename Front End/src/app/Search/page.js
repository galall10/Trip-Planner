"use client";
import React, { useState } from 'react';
import Link from 'next/link'; 
import Sidebar from '../components/Sidebar';
import styles from '../styles/Search.module.css';


const SearchPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!searchTerm) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`http://localhost:5000/api/v1/user/searchUsers?query=${encodeURIComponent(searchTerm)}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch search results');
            }

            const data = await response.json();

            if (Array.isArray(data.users)) {
                setResults(data.users);
            } else {
                setResults([]);
                setError('Unexpected response format');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Sidebar />
            <h2 className={styles.title}>Search Users</h2>
            <div className={styles.searchBar}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by username or name"
                    className={styles.searchInput}
                />
                <button onClick={handleSearch} className={styles.searchButton}>Search</button>
            </div>

            {isLoading && <p className={styles.loading}>Loading...</p>}
            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.results}>
                {results.length > 0 ? (
                    results.map((user) => (
                        <div key={user._id} className={styles.resultItem}>
                             <Link href={`/profile?userId=${user._id}`}>
                            {user.profilePicture && (
                                <img src={user.profilePicture} alt={`${user.username}'s profile`} className={styles.profilePicture} />
                            )}
                            <div className={styles.userInfo}>
                                <p className={styles.username}><strong>Username:</strong> {user.username}</p>
                                <p className={styles.name}><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                            </div>
                            </Link>
                        </div>
                    ))
                ) : (
                    !isLoading && !error && <p className={styles.noResults}>No results found</p>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
