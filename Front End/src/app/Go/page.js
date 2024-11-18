"use client";
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import styles from '../styles/go.module.css';
import Sidebar from '../components/Sidebar';

const Go = () => {
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [activities, setActivities] = useState([]);
    const [peopleCount, setPeopleCount] = useState(1);
    const [priceLevel, setPriceLevel] = useState(1);
    const [destinations, setDestinations] = useState([]);
    const [error, setError] = useState('');
    const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
    const [isLoading, setIsLoading] = useState(false); // State for loading indicator

    const activityOptions = [
        'Historical',
        'Shopping',
        'Museum',
        'Art & Culture',
        'Amusement Parks',
        'Park',   
        'Natural Feature'
    ];

    const handleActivityClick = (activity) => {
        setActivities(prevActivities =>
            prevActivities.includes(activity)
                ? prevActivities.filter(act => act !== activity)
                : [...prevActivities, activity]
        );
    };

    const datesOverlap = (start1, end1, start2, end2) => {
        return (start1 <= end2) && (start2 <= end1);
    };

    const geocodeCity = async (city) => {
        const apiKey = 'AIzaSyCEiN_zfOmYirRa2c2gbhumce4S0kz7n9E'; 
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${apiKey}`);
        const location = response.data.results[0]?.geometry.location;
        if (location) {
            return { lat: location.lat, lng: location.lng };
        } else {
            setError('Unable to find the location.');
            return null;
        }
    };

    const handleAddDestination = async () => {
        if (destination && startDate && endDate) {
            const dayDifference = (endDate - startDate) / (1000 * 60 * 60 * 24);
            if (dayDifference > 20) {
                setError('Trip duration cannot exceed 20 days.');
                return;
            }
            for (let dest of destinations) {
                if (datesOverlap(startDate, endDate, dest.startDate, dest.endDate)) {
                    setError('Date ranges for destinations cannot overlap.');
                    return;
                }
            }

            const coords = await geocodeCity(destination);
            if (coords) {
                setCoordinates(coords);

                setDestinations(prevDestinations => [
                    ...prevDestinations,
                    { destination, startDate, endDate, ...coords }
                ]);
                setDestination('');
                setStartDate(null);
                setEndDate(null);
                setError('');
            }
        }
    };

    const handleRemoveDestination = (index) => {
        setDestinations(prevDestinations => prevDestinations.filter((_, i) => i !== index));
    };

    const handleGoAI = () => {
        if (destinations.length === 0) {
            setError('Please choose a destination first.');
            return;
        }
        
        if (activities.length === 0) {
            setError('Please choose at least one category.');
            return;
        }
        
        if (destinations.length > 0) {
            const { lat, lng } = destinations[0];
            const day = Math.ceil((destinations[0].endDate - destinations[0].startDate) / (1000 * 60 * 60 * 24)) + 1;
            const your_array = activityOptions.map(activity => activities.includes(activity) ? 1 : 0).join('&your_array=');
            const url = `http://127.0.0.1:5000/your_endpoint?day=${day}&lng=${lng}&lat=${lat}&price=${priceLevel}&your_array=${your_array}`;
    
            setIsLoading(true);
    
            axios.get(url)
                .then(response => { 
                    if (typeof response.data === 'string') {
                        JSON.parse(response.data);
                    }
                     
                        const tripDetails = {
                            destination: destinations[0].destination,
                            startDate: destinations[0].startDate,
                            endDate: destinations[0].endDate,
                            itinerary: response.data
                        };
        
                        localStorage.setItem('tripData', JSON.stringify(tripDetails));
        
                        window.location.href = 'Go/CreateTrip';
                    
                })
                .catch(error => {
                    console.error('There was an error making the request:', error);
                    setError('Failed to fetch trip data. Please try again.');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    };

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.mainContent}>
                <h1 className={styles.title}>Where do you want to go?</h1>
                <input
                    type="text"
                    placeholder="Select a city"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className={styles.destinationinput}
                />
                <DatePicker
                    selected={startDate}
                    onChange={(dates) => {
                        const [start, end] = dates;
                        setStartDate(start);
                        setEndDate(end);
                    }}
                    startDate={startDate}
                    endDate={endDate}
                    selectsRange
                    minDate={new Date()}
                    placeholderText="Select dates"
                    className={styles.datesinput}
                />
                <button onClick={handleAddDestination} className={styles.addDestinationButton}>
                    Add destination
                </button>

                {error && <p className={styles.error}>{error}</p>}

                {destinations.length > 0 && (
                    <div className={styles.destinationList}>
                        <h2 className={styles.subtitle}>Selected Destinations</h2>
                        {destinations.map((dest, index) => (
                            <div key={index} className={styles.destinationItem}>
                                <div>
                                    <strong>{dest.destination}</strong>
                                    <p>{`From ${dest.startDate.toLocaleDateString()} to ${dest.endDate.toLocaleDateString()}`}</p>
                                </div>
                                <button
                                    onClick={() => handleRemoveDestination(index)}
                                    className={styles.removeButton}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <h2 className={styles.subtitle}>Select the kind of activities you want to do</h2>
                <div style={{ marginBottom: '20px' }}>
                    {activityOptions.map((activity, index) => (
                        <button
                            key={index}
                            onClick={() => handleActivityClick(activity)}
                            className={`${styles.activityButton} ${activities.includes(activity) ? styles.selectedActivity : styles.unselectedActivity}`}
                        >
                            {activity}
                        </button>
                    ))}
                </div>
                <h2 className={styles.subtitle}>Select your price level</h2>
                <div className={styles.priceLevelContainer}>
                    <input
                        type="range"
                        min="1"
                        max="3"
                        value={priceLevel}
                        onChange={(e) => setPriceLevel(parseInt(e.target.value))}
                        className={styles.priceSlider}
                    />
                    <div className={styles.priceLabels}>
                        <span className={priceLevel === 1 ? styles.selectedPrice : ''}>$</span>
                        <span className={priceLevel === 2 ? styles.selectedPrice : ''}>$$</span>
                        <span className={priceLevel === 3 ? styles.selectedPrice : ''}>$$$</span>
                    </div>
                </div>


                <div className={styles.actionButtons}>
                    
                        <button onClick={handleGoAI} className={styles.actionButton}>
                            {isLoading ? 'Creating Trip...' : 'Go AI'}
                        </button>
                </div>
            </div>
        </div>  
    );
};

export default Go;