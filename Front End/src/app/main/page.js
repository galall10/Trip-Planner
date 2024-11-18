'use client';
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Post from '../components/posts';
import styles from '../styles/main.module.css';

const HomePage = () => {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/v1/user/getHomePage', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch posts');
                }

                const data = await response.json();
                console.log(data); // Logging the fetched data for debugging
                setPosts(data.posts);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <img src="/GIF/Arrow Animation.gif" alt="Loading..." className={styles.loadingGif} />
            </div>
        );
    }

    if (error) {
        return <div className={styles.error}>Error: {error}</div>;
    }

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.mainContent}>
                <div className={styles.posts}>
                    {posts.length > 0 ? (
                        posts.map((post, index) => (
                            <Post key={index} post={post} isCurrentUser={true} />
                        ))
                    ) : (
                        <div>No posts available</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
