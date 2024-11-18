"use client";
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import styles from '../styles/settings.module.css'; 

const SettingsPage = () => {
    const [user, setUser] = useState({

        profilePicture: '/Props/GuestPP.jpg',
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phoneNumber: '',
        bio: '',
        dateOfBirth: '',
        gender: '',
        traits: []
    });

    const [selectedTraits, setSelectedTraits] = useState([]);
    const [notification, setNotification] = useState('');
    const [token, setToken] = useState('');
    const [profilePictureFile, setProfilePictureFile] = useState(null);

    const traitsList = [
        'Active', "Relaxed", 'Camping', 'Hiking', 'Sea', 'Cultural',
        'Historic', 'Adventurous', 'Indoor', 'Completionist', "Nature Lover", "Foodie", "Night Owl", "Early Riser", "Planner", "Spontaneous", "Budget Traveler",
        "Luxury Traveler", "Solo Traveler", "Group Traveler", "Family Traveler", "Romantic Getaway Seeker", "Backpacker", "Business Traveler", "Outdoor Activities",
        "Water Activities", "Arts and Culture", "Shopping", "Sports", "Learning", "Socializing", "Escapism", "Discovery", "Volunteerism",
        "Pet-Friendly Travel", "Accessibility Needs", "Urban", "Rural", "Coastal", "Mountainous", "Tropical", "Desert",
        "Modern Cities", "Vegetarian", "Vegan", "Gluten-Free", "Local Cuisine", "International Cuisine", "Street Food", "Fine Dining"
    ];

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        if (storedUser && storedToken) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setSelectedTraits(parsedUser.traits);
            setToken(storedToken);
        }
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setUser({
            ...user,
            [id]: value,
        });
    };

    const handleTraitSelect = (trait) => {
        if (selectedTraits.includes(trait)) {
            setSelectedTraits(selectedTraits.filter(t => t !== trait));
        } else {
            setSelectedTraits([...selectedTraits, trait]);
        }
    };

    const handlePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePictureFile(file);
            const reader = new FileReader();
            reader.onload = () => {
                setUser({ ...user, profilePicture: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const saveSettings = async () => {
        const updatedUser = { 
            profilePicture: user.profilePicture,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            phoneNumber: user.phoneNumber,
            bio: user.bio,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            traits: selectedTraits 
        };
    
        try {

            const formData = new FormData();
            // if (profilePictureFile) {
            //     formData.append('profilePicture', profilePictureFile);
            // }
    
            Object.keys(updatedUser).forEach(key => {
                if (key === 'traits') {
                    updatedUser[key].forEach(element => {
                        formData.append(key,element)
                    });
                } else {
                    formData.append(key, updatedUser[key]);
                }
            });
            
    
            const response = await fetch('http://localhost:5000/api/v1/user/updateUser', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,

                },
                body: formData,
            });
    
            const data = await response.json();
            console.log('Response data:', data);
    
            if (response.ok) {
                setNotification('Settings saved');
                localStorage.setItem('user', JSON.stringify(data.user));
                setUser(data.user);
                setTimeout(() => {
                    setNotification('');
                }, 3000);
            } else {
                console.error('Failed to save settings:', data);
                setNotification('Failed to save settings');
                setTimeout(() => {
                    setNotification('');
                }, 3000);
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setNotification('Failed to save settings');
            setTimeout(() => {
                setNotification('');
            }, 3000);
        }
    };
    

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <div className={styles.container}>
            <Sidebar /> {/* Ensure Sidebar is correctly placed here */}
            <div className={styles.settingsContent}>
                <h2 className={styles.sectionTitle}>Profile Settings</h2>

                <div className={styles.profileSection}>
                    <div className={styles.profilePicture}>
                        <img src={user.profilePicture} alt="Profile" />
                        <label htmlFor="fileInput" className={styles.changePictureBtn}>Change Picture</label>
                        <input id="fileInput" type="file" accept="image/*" onChange={handlePictureChange} style={{ display: 'none' }} />
                    </div>

                    <div className={styles.profileDetails}>
                        <div className={styles.fullName}>
                            <label>Full Name:</label>
                            <p>{user.firstName} {user.lastName}</p>
                        </div>

                        <div className={styles.username}>
                            <label>Username:</label>
                            <input type="text" id="username" value={user.username} onChange={handleChange} />
                        </div>

                        <div className={styles.email}>
                            <label>Email:</label>
                            <p>{user.email}</p>
                        </div>

                        <div className={styles.mobile}>
                            <label>Mobile Number:</label>
                            <input type="text" id="mobile" value={user.phoneNumber} onChange={handleChange} />
                        </div>

                        <div className={styles.bio}>
                            <label>Bio:</label>
                            <textarea id="bio" value={user.bio} onChange={handleChange} />
                        </div>

                        <div className={styles.birthDate}>
                            <label>Date of Birth:</label>
                            <p>{formatDate(user.dateOfBirth)}</p>
                        </div>

                        <div className={styles.gender}>
                            <label>Gender:</label>
                            <p>{user.gender}</p>
                        </div>
                    </div>
                </div>

                <div className={styles.traitsSection}>
                    <h3>Choose your traits:</h3>
                    <div className={styles.traits}>
                        {traitsList.map(trait => (
                            <div key={trait} className={`${styles.trait} ${selectedTraits.includes(trait) ? styles.selected : ''}`} onClick={() => handleTraitSelect(trait)}>
                                {trait}
                            </div>
                        ))}
                    </div>
                </div>

                <button className={styles.saveBtn} onClick={saveSettings}>Save Settings</button>

                {notification && (
                    <div className={`${styles.notification} ${styles.slideIn}`}>
                        {notification}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsPage;
