"use client"; // Specify that this component should run on the client side

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import styles from '../styles/review.module.css'; // Adjust the CSS module path as per your actual file location

const CreateReviewPage = () => {
    const [caption, setCaption] = useState('');
    const [location, setLocation] = useState('');
    const [images, setMediaFiles] = useState([]);
    const [rating, setRating] = useState(0);
    const [trip, setTrip] = useState(null);

    useEffect(() => {
        // Fetch the trip from localStorage
        const storedTrip = localStorage.getItem('tripDetails');
        if (storedTrip) {
            const parsedTrip = JSON.parse(storedTrip);
            console.log('Retrieved trip from localStorage:', parsedTrip); // Log the trip data
            setTrip(parsedTrip);
        }
    }, []);

    const handleRating = (stars) => {
        setRating(stars);
    };

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
        formData.append('rating', rating);

        try {
            // First request to create the review and get the _id
            const response = await fetch('http://localhost:5000/api/v1/review/createReview', {
                method: 'POST',
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to submit review: ${response.statusText}`);
            }

            const responseData = await response.json();
            const reviewId = responseData.review._id;

            // Second request to add media files
            for (const imageBinary of images) {
                const imageData = new FormData();
                imageData.append('image', imageBinary);
                imageData.append('id', reviewId);

                const imageResponse = await fetch('http://localhost:5000/api/v1/review/addMedia', {
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
            setRating(0);
            alert('Review and images submitted successfully');
            window.location.href = 'http://localhost:3000/main'; // Redirect to main page after submission

        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while submitting the review and images.');
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
                <h1 className={styles.title}>Review Your Trip</h1>
                {trip ? (
                    <div className={styles.trips}>
                        <h3 className={styles.sectionTitle}>My Trip</h3>
                        <div key={trip._id} className={styles.trip}>
                            <Link href={`/trip?tripId=${trip._id}`}>
                                <div className={styles.tripDetails}>
                                    <h4 className={styles.tripName}>{trip.name}</h4>
                                    <p className={styles.tripDate}>Start: {new Date(trip.startDate).toLocaleDateString()}</p>
                                    <p className={styles.tripDate}>End: {new Date(trip.endDate).toLocaleDateString()}</p>
                                    <p className={styles.tripCity}>City: {trip.city}</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <p>No trip available.</p>
                )}
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
                        <label className={styles.label}>Rating:</label>
                        <div className={styles.rating}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={star <= rating ? styles.starFilled : styles.star}
                                    onClick={() => handleRating(star)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>
                    <button type="submit" className={styles.submitButton}>
                        Publish Review
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateReviewPage;
