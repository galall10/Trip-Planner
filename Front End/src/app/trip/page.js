"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import MapComponent from '../components/Map';
import Modal from '../components/Modal'; // Ensure you have a Modal component
import styles from '../styles/Trip.module.css';

const TripPage = () => {
  const searchParams = useSearchParams();
  const tripId = searchParams.get('tripId');

  const [tripData, setTripData] = useState({});
  const [markers, setMarkers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [name, setTripName] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [city, setCity] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [error, setError] = useState('');
  const [expandedDay, setExpandedDay] = useState(null);
  const [trip, setTrip] = useState(null); // To store the whole trip object
  const [showModal, setShowModal] = useState(false);
  const [isCompanion, setIsCompanion] = useState(false); // State for companion status
  const [modalTitle, setModalTitle] = useState(''); // State for modal title
  const [modalContent, setModalContent] = useState([]); // State for modal content
  const [currentUserId, setCurrentUserId] = useState(null); // State for current user ID

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user._id) {
        setCurrentUserId(user._id);
      }
    }
  }, []);

  useEffect(() => {
    const fetchTripData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/v1/trip/getTrip/${tripId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch trip data');
        }

        const data = await response.json();
        const trip = data.trip;

        if (!trip || !trip.itinerary) {
          throw new Error('Invalid trip data');
        }

        const parsedItinerary = JSON.parse(trip.itinerary);
        setTrip(trip); // Store the entire trip object
        setTripData(parsedItinerary);
        updateMarkersAndRoutes(parsedItinerary);
        setTripName(trip.name);
        setStartDate(new Date(trip.startDate));
        setEndDate(new Date(trip.endDate));
        setCity(trip.destination);
        setIsCompanion(trip.companions.some(companion => companion._id === currentUserId)); // Set initial companion status
      } catch (err) {
        setError(err.message);
        console.error(err.message);
      }
    };

    if (tripId) {
      fetchTripData();
    }
  }, [tripId, currentUserId]);

  const updateMarkersAndRoutes = (data) => {
    let newMarkers = [];
    let newRoutes = [];

    if (!data) return;

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

  const renderTripDetails = (day) => {
    if (!tripData[day]) return <p>No data for this day.</p>;

    const mainActivities = tripData[day].filter(trip => trip.priority === 'main');
    const suggestedActivities = tripData[day].filter(trip => trip.priority === 'suggested');

    return (
      <div className={styles.dayDetails}>
        <div className={styles.mainActivities}>
          {mainActivities.map((trip, index) => (
            <div key={index} className={styles.activityBox} onClick={() => handlePlaceClick(trip)}>
              <h1>{trip.name}</h1>
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

  const handleJoinOrLeaveTrip = async () => {
    try {
      const id = tripId;
      const response = await fetch(`http://localhost:5000/api/v1/trip/followTrip`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });

      if (!response.ok) {
        throw new Error('Failed to update trip participation status');
      }

      const data = await response.json();

      setTrip(prevTrip => {
        const updatedTrip = {
          ...prevTrip,
          companions: isCompanion
            ? prevTrip.companions.filter(companion => companion._id !== currentUserId)
            : [...prevTrip.companions, { _id: currentUserId }] // Add the current user object
        };
        setIsCompanion(!isCompanion);
        return updatedTrip;
      });
    } catch (err) {
      setError(err.message);
      console.error(err.message);
    }
  };

  const handleShowCompanions = () => {
    setModalTitle('Companions');
    setModalContent(trip.companions);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleUserClick = (id) => {
    window.location.href = `/profile?userId=${id}`;
  };

  const handleDayToggle = (day) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.tripContent}>
          <h2 className={styles.tripName}>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!tripData || !name) {
    return (
      <div className={styles.container}>
        <div className={styles.tripContent}>
          <h2 className={styles.tripName}>Loading...</h2>
        </div>
      </div>
    );
  }

  const isOwner = trip && trip.createdBy._id === currentUserId;

  return (
    <div className={styles.createTrip}>
      
      <div className={styles.itineraryContainer}>
      <img src={trip.createdBy.profilePicture} alt={trip.createdBy.username} className={styles.profilePicture} />
        <div className={styles.tripInfo}>
          <h1 className={styles.tripName}>{name}</h1>
          <p className={styles.tripDates}>
            {startDate && endDate && `${startDate.toDateString()} - ${endDate.toDateString()}`}
          </p>
          <p className={styles.tripCreator}>Created by: {trip.createdBy.username}</p>
        </div>
       
        <div className={styles.buttonGroup}>
        <button onClick={handleShowCompanions} className={styles.viewCompanionsButton}>
          View Companions
        </button>
        {!isOwner && (
          
            <button onClick={handleJoinOrLeaveTrip} className={styles.joinTripButton}>
              {isCompanion ? 'Leave Trip' : 'Join Trip'}
            </button>
        )}
                  </div>


        {Object.keys(tripData).map((day, dayIndex) => (
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
        ))}
      </div>
      <div className={styles.mapContainer}>
        <MapComponent markers={markers} routes={routes} selectedPlace={selectedPlace} />
      </div>
      {showModal && (
        <Modal onClose={handleCloseModal}>
          <h3>{modalTitle}</h3>
          {modalContent.length === 0 ? (
            <p>No {modalTitle.toLowerCase()} found.</p>
          ) : (
            <ul className={styles.modalList}>
              {modalContent.map(person => (
                <li key={person._id} className={styles.modalListItem} onClick={() => handleUserClick(person._id)}>
                  <img className={styles.modalProfilePicture} src={person.profilePicture} alt={person.username} />
                  <div className={styles.modalUserInfo}>
                    <p className={styles.modalUsername}>{person.username}</p>
                    <p className={styles.modalFullName}>{person.firstName} {person.lastName}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}
    </div>
  );
}

export default TripPage;
