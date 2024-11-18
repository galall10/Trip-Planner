"use client";
import React, { useState, useEffect } from 'react';
import MapComponent from '../../components/Map';
import Sidebar from '../../components/Sidebar'; // Adjust path as necessary
import styles from '../../styles/CreateTrip.module.css';

const CreateTrip = () => {
  const [tripData, setTripData] = useState({});
  const [markers, setMarkers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [name, setTripName] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [city, setCity] = useState('');
  const [token, setToken] = useState('');
  const [itinerary, setItinerary] = useState('');
  const [expandedDay, setExpandedDay] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [error, setError] = useState('');

  const visibility = 'Private';

  useEffect(() => {
    const storedTripData = localStorage.getItem('tripData');
    if (storedTripData) {
      try {
        const parsedData = JSON.parse(storedTripData);

        if (typeof parsedData.itinerary === 'string') {
          setError('Please add more activities to your trip.');
        } else {
          setTripData(parsedData.itinerary);
          updateMarkersAndRoutes(parsedData.itinerary);
          setStartDate(parsedData.startDate);
          setEndDate(parsedData.endDate);
          setCity(parsedData.destination);
          setItinerary(JSON.stringify(parsedData.itinerary)); // This line might not be necessary anymore
        }
      } catch (error) {
        console.error('Error parsing stored itinerary:', error);
        setError('Failed to parse trip itinerary.');
      }
    }

    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const updateMarkersAndRoutes = (data) => {
    let newMarkers = [];
    let newRoutes = [];

    Object.keys(data).forEach((day, dayIndex) => {
      const dayMarkers = data[day]
        .filter(trip => trip.priority === 'main')
        .map((trip, index) => ({
          lat: trip.geometry.location.lat,
          lng: trip.geometry.location.lng,
          day: day,
          color: `color-${dayIndex + 1}` // Assign a color class based on day index
        }));

      newMarkers = [...newMarkers, ...dayMarkers];

      const routeCoordinates = dayMarkers.map(marker => ({
        lat: marker.lat,
        lng: marker.lng
      }));

      newRoutes.push(routeCoordinates);
    });

    setMarkers(newMarkers);
    setRoutes(newRoutes);
  };

  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
    if (place.priority === 'suggested') {
      setMarkers(prevMarkers => [
        ...prevMarkers,
        {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          day: place.day,
          color: 'suggested-color'
        }
      ]);
    }
  };
  const handleSaveTrip = async () => {
    const tripDetails = {
      name,
      startDate,
      endDate,
      itinerary,
      city,
      visibility
    };

    try {
      const response = await fetch('http://localhost:5000/api/v1/trip/createTrip', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tripDetails)
      });

      if (!response.ok) {
        throw new Error('Failed to save the trip');
      }

      alert('Trip saved successfully!');
    } catch (error) {
      console.error('There was an error saving the trip:', error);
      alert('Failed to save the trip. Please try again.');
    }
  };

  const renderTripDetails = (day) => {
    if (!tripData[day]) return <p>No data for this day.</p>;

    const mainActivities = tripData[day].filter(trip => trip.priority === 'main');
    const suggestedActivities = tripData[day].filter(trip => trip.priority === 'suggested');

    return (
      <div className={styles.dayDetails}>
        <div className={styles.mainActivities}>
          {mainActivities.map((trip, index) => (
            <div key={index} className={styles.activityBox} onClick={() => handlePlaceClick(trip)}>
              <h3>{trip.name}</h3>
              <img
                src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${trip.photos[0].photo_reference}&key=AIzaSyCEiN_zfOmYirRa2c2gbhumce4S0kz7n9E`}
                alt={trip.name}
                className={styles.activityImage}
                onError={(e) => {
                  console.error('Error loading photo:', e);
                  e.target.src = '/placeholder-image.jpg'; // Placeholder image or alternative fallback
                }}
              />
              <p>Rating: {trip.rating}</p>
              <p>Address: {trip.vicinity}</p>
              <p>Type: {trip.type}</p>
            </div>
          ))}
        </div>
        <h3>Suggested Places</h3>
        <div className={styles.suggestedActivities}>
          {suggestedActivities.map((trip, index) => (
            <div key={index} className={styles.suggestedActivityBox} onClick={() => handlePlaceClick(trip)}>
              <h3>{trip.name}</h3>
              <img
                src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${trip.photos[0].photo_reference}&key=AIzaSyCEiN_zfOmYirRa2c2gbhumce4S0kz7n9E`}
                alt={trip.name}
                className={styles.suggestedActivityImage}
                onError={(e) => {
                  console.error('Error loading photo:', e);
                  e.target.src = '/placeholder-image.jpg'; // Placeholder image or alternative fallback
                }}
              />
              <p>Rating: {trip.rating}</p>
              <p>Address: {trip.vicinity}</p>
              <p>Type: {trip.type}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleDayToggle = (day) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  return (
    <div className={styles.createTrip}>
      <div className={styles.itineraryContainer}>
        <div className={styles.tripForm}>
          <input
            type="text"
            placeholder="Trip Name"
            value={name}
            onChange={(e) => setTripName(e.target.value)}
            className={styles.tripNameInput}
          />
          <button onClick={handleSaveTrip} className={styles.saveTripButton}>
          Save Trip
        </button>
        </div>
        {error ? (
          <div className={styles.errorContainer}>
            <p>{error}</p>
          </div>
        ) : (
          Object.keys(tripData).map((day, dayIndex) => (
            <div key={day} className={styles.dayDropdown}>
              <button
                className={`${styles.dayButton} ${expandedDay === day ? styles.activeDayButton : ''}`}
                onClick={() => handleDayToggle(day)}
              >
                <span className={styles.dayIndicatorContainer}>
                  <span className={styles.dayColorIndicator} style={{ backgroundColor: `var(--color-${dayIndex + 1})` }}></span>
                  <span className={styles.dayLabel}>{day}</span>
                </span>
              </button>
              {expandedDay === day && (
                <div className={styles.dayContent}>
                  {renderTripDetails(day)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <div className={styles.mapContainer}>
        <MapComponent markers={markers} routes={routes} selectedPlace={selectedPlace} />
      </div>
    </div>
  );
};

export default CreateTrip;