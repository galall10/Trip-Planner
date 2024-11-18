"use client"; // Specify that this component should run on the client side

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import styles from '../styles/post.module.css'; // Adjust the CSS module path as per your actual file location

const PostPage = () => {
    const [caption, setCaption] = useState('');
    const [location, setLocation] = useState('');
    const [images, setMediaFiles] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token'); // Retrieve the token from localStorage
        if (!token) {
            alert('No token found. Please log in.');
            return;
        }

        const formData = new FormData();
        formData.append('caption', caption);
        formData.append('location', location);

        try {
            // First request to create the post and get the _id
            const response = await fetch('http://localhost:5000/api/v1/post/createPost', {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to submit post: ${response.statusText}`);
            }

            const responseData = await response.json();
            const postId = responseData.post._id;

            // Second request to add media files
            for (const imageBinary of images) {
                const imageData = new FormData();
                imageData.append('image', imageBinary);
                imageData.append('id', postId);

                const imageResponse = await fetch('http://localhost:5000/api/v1/post/addMedia', {
                    method: 'POST',
                    body: imageData,
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!imageResponse.ok) {
                    throw new Error(`Failed to submit image: ${imageResponse.statusText}`);
                }
            }

            // Reset form fields or show success message
            setCaption('');
            setLocation('');
            setMediaFiles([]);
            alert('Post and images submitted successfully');
            window.location.href = 'http://localhost:3000/main';

        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while submitting the post and images.');
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setMediaFiles(files);
    };

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.mainContent}>
                <h1 className={styles.title}>Share Your Trip</h1>
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label className={styles.label}>Upload Pictures:</label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className={styles.fileInput}
                            multiple
                            required
                        />
                        {images.length > 0 && (
                            <div className={styles.previewContainer}>
                                {images.map((file, index) => (
                                    <img
                                        key={index}
                                        src={URL.createObjectURL(file)}
                                        alt={`Uploaded media ${index + 1}`}
                                        className={styles.previewImage}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Caption:</label>
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            className={styles.textarea}
                            rows={4}
                        ></textarea>
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Location:</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className={styles.input}
                        />
                    </div>
                    <a href="/main">
                        <button type="submit" className={styles.submitButton}>
                            Post
                        </button>
                    </a>
                </form>
            </div>
        </div>
    );    
};

export default PostPage;
