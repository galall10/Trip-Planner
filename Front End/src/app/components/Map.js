"use client";
import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, Marker, DirectionsRenderer, InfoWindow, useLoadScript } from '@react-google-maps/api';
import styles from '../styles/Map.module.css'; // Create a CSS module for styling

const MapComponent = ({ coordinates, markers, routes, selectedPlace }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyCEiN_zfOmYirRa2c2gbhumce4S0kz7n9E',
  });
  const [directions, setDirections] = useState([]);
  const [infoWindowPosition, setInfoWindowPosition] = useState(null);
  const mapRef = useRef(null);

  const onLoad = React.useCallback((mapInstance) => {
    mapRef.current = mapInstance;
  }, []);

  useEffect(() => {
    if (isLoaded && routes.length) {
      const directionsService = new window.google.maps.DirectionsService();
      routes.forEach((route, index) => {
        const waypoints = route.slice(1, -1).map(point => ({
          location: { lat: point.lat, lng: point.lng },
          stopover: true,
        }));
        directionsService.route(
          {
            origin: route[0],
            destination: route[route.length - 1],
            waypoints: waypoints,
            travelMode: window.google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              setDirections(prevDirections => [...prevDirections, { ...result, colorIndex: index }]);
            } else {
              console.error(`Error fetching directions: ${result}`);
            }
          }
        );
      });
    }
  }, [isLoaded, routes]);

  useEffect(() => {
    if (selectedPlace && mapRef.current) {
      const { lat, lng } = selectedPlace.geometry.location;
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(15);
      setInfoWindowPosition({ lat, lng });
    }
  }, [selectedPlace]);

  if (!isLoaded) return <div>Loading...</div>;

  const markerColors = {
    'color-1': 'red',
    'color-2': 'blue',
    'color-3': 'green',
    'color-4': 'yellow',
    'color-5': 'pink',
    'color-6': 'orange',
    'color-7': 'purple',
    'color-8': 'black',
    'color-9': 'darkblue',
    'color-10': 'gray',
    'color-11': 'cyan',
    'color-12': 'magenta',
    'color-13': 'brown',
    'color-14': 'lime',
    'color-15': 'teal',
    'color-16': 'navy',
    'color-17': 'olive',
    'color-18': 'silver',
    'color-19': 'gold',
    'color-20': 'maroon',
  };

  const mapStyles = {
    width: '100%',
    height: '100%',
    float: 'right',
  };

  // Combine markers and routes
  const combinedMarkers = markers
    .map(marker => ({
      ...marker,
      routeIndex: routes.findIndex(route =>
        route.some(point => point.lat === marker.lat && point.lng === marker.lng)
      ),
    }))
    .filter(marker => marker.routeIndex !== -1);

  return (
    <div className={styles.mapContainer}>
      <GoogleMap
        zoom={10}
        center={coordinates}
        mapContainerStyle={mapStyles}
        onLoad={onLoad}
        options={{ disableDefaultUI: false }} // Disable default UI to remove default markers
      >
        {combinedMarkers.map((marker, index) => (
          <Marker
            key={index}
            position={{ lat: marker.lat, lng: marker.lng }}
            icon={{
              url: `http://maps.google.com/mapfiles/ms/icons/${markerColors[`color-${marker.routeIndex + 1}`]}-dot.png`,
            }}
          />
        ))}
        {directions.map((direction, index) => (
          <DirectionsRenderer
            key={index}
            directions={direction}
            options={{
              polylineOptions: {
                strokeColor: markerColors[`color-${direction.colorIndex + 1}`],
                strokeOpacity: 0.8,
                strokeWeight: 4,
              },
              suppressMarkers: true, // This line disables the default route markers
            }}
          />
        ))}
        {selectedPlace && infoWindowPosition && (
          <InfoWindow
            position={infoWindowPosition}
            onCloseClick={() => setInfoWindowPosition(null)}
          >
            <div className={styles.infoWindow}>
              <h3>{selectedPlace.name}</h3>
              <img
                src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=${selectedPlace.photos[0].photo_reference}&key=AIzaSyCEiN_zfOmYirRa2c2gbhumce4S0kz7n9E`}
                alt={selectedPlace.name}
                onError={(e) => {
                  console.error('Error loading photo:', e);
                  e.target.src = '/placeholder-image.jpg'; // Placeholder image or alternative fallback
                }}
              />
              <p>Rating: {selectedPlace.rating}</p>
              <p>Address: {selectedPlace.vicinity}</p>
              <p>Type: {selectedPlace.type}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default MapComponent;
