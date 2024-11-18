'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import Post from '../components/posts';
import styles from '../styles/Profile.module.css';

const ProfilePage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const userId = searchParams.get('userId');
    const currentUser = JSON.parse(localStorage.getItem('user'));

    const [user, setUser] = useState(null);
    const [trips, setTrips] = useState([]);
    const [posts, setPosts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState([]);
    const [modalTitle, setModalTitle] = useState('');
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedTab, setSelectedTab] = useState('posts'); // Start with 'posts' tab selected
    const [error, setError] = useState('');
    const [isFollowing, setIsFollowing] = useState(false);

    const isCurrentUser = userId === null || currentUser._id === userId;

    useEffect(() => {
        const fetchUserData = async (id) => {
            try {
                const response = await fetch(`http://localhost:5000/api/v1/user/getUser/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const data = await response.json();
                setUser(data.user);
                setFollowers(data.user.followers);
                setFollowing(data.user.following);
                setIsFollowing(data.user.followers.some(follower => follower._id === currentUser._id));
            } catch (err) {
                setError(err.message);
                console.error(err.message);
            }
        };

        const fetchUserPosts = async (id) => {
            try {
                const response = await fetch(`http://localhost:5000/api/v1/post/getAllUserPosts/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user posts');
                }

                const data = await response.json();
                setPosts(data.posts);
            } catch (err) {
                setError(err.message);
                console.error(err.message);
            }
        };

        const fetchUserTrips = async (id) => {
            try {
                const url = isCurrentUser 
                    ? `http://localhost:5000/api/v1/trip/getAllMyTrips` 
                    : `http://localhost:5000/api/v1/trip/getAllUserTrips/${id}`;
                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user trips');
                }

                const data = await response.json();
                setTrips(data.trips);
            } catch (err) {
                setError(err.message);
                console.error(err.message);
            }
        };

        const fetchUserReviews = async (id) => {
            try {
                const response = await fetch(`http://localhost:5000/api/v1/review/getAllUserReviews/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user reviews');
                }

                const data = await response.json();
                setReviews(data.reviews);
            } catch (err) {
                setError(err.message);
                console.error(err.message);
            }
        };

        if (userId) {
            fetchUserData(userId);
            fetchUserPosts(userId);
            fetchUserTrips(userId);
            fetchUserReviews(userId);
        } else if (currentUser) {
            setUser(currentUser);
            setFollowers(currentUser.followers);
            setFollowing(currentUser.following);
            fetchUserPosts(currentUser._id);
            fetchUserTrips(currentUser._id);
            fetchUserReviews(currentUser._id);
        }
    }, [userId, isCurrentUser]);

    const handleShowModal = (content, title) => {
        setModalContent(content);
        setModalTitle(title);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalContent([]);
    };

    const handleProfilePictureClick = () => {
        setShowProfileModal(true);
    };

    const handleCloseProfileModal = () => {
        setShowProfileModal(false);
    };

    const handleFollowToggle = async () => {
        try {   
            const response = await fetch(`http://localhost:5000/api/v1/user/followUser`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: user._id })
            });

            if (!response.ok) {
                throw new Error('Failed to follow/unfollow user');
            }

            const data = await response.json();
            setIsFollowing(!isFollowing);
            setFollowers(prevFollowers => {
                if (isFollowing) {
                    return prevFollowers.filter(follower => follower._id !== currentUser._id);
                } else {
                    return [...prevFollowers, { _id: currentUser._id }];
                }
            });
        } catch (err) {
            setError(err.message);
            console.error(err.message);
        }
    };

    const handleUserClick = (id) => {
        router.push(`/profile?userId=${id}`);
        handleCloseModal();
    };

    const handleTripClick = (tripId) => {
        const url = isCurrentUser 
            ? `/trip?tripId=${tripId}&myTrip=true`
            : `/trip?tripId=${tripId}`;
        router.push(url);
    };

    const handleReviewClick = (tripId) => {
        localStorage.setItem('reviewTripId', tripId);
        router.push('/Review');
    };

    if (error) {
        return (
            <div className={styles.container}>
                <Sidebar />
                <div className={styles.profileContent}>
                    <h2 className={styles.username}>Error</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={styles.container}>
                <Sidebar />
                <div className={styles.profileContent}>
                    <h2 className={styles.username}>Guest</h2>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Sidebar />
            <div className={styles.profileContent}>
                <div className={styles.profileHeader}>
                    <div className={styles.profilePictureWrapper} onClick={handleProfilePictureClick}>
                        <img className={styles.profilePicture} src={user.profilePicture} alt="Profile" />
                    </div>
                    <div className={styles.userInfo}>
                        <h2 className={styles.username}>{user.username}</h2>
                        <div className={styles.stats}>
                            <span onClick={() => handleShowModal(followers, 'Followers')}>{followers.length} Followers</span>
                            <span onClick={() => handleShowModal(following, 'Following')}>{following.length} Following</span>
                            {isCurrentUser && <span>{trips.length} Trips</span>}
                        </div>
                        <p className={styles.bio}>{user.bio}</p>
                        <div className={styles.traits}>
                            {user.traits.map((trait, index) => (
                                <div key={index} className={styles['trait-box']}>{trait}</div>
                            ))}
                        </div>
                    </div>

                    {isCurrentUser ? (
                        <div className={styles.editbutton}>
                            <button onClick={() => router.push('/profileSettings')}>Edit Profile</button>
                        </div>
                    ) : (
                        <div className={styles.actions}>
                            <button onClick={handleFollowToggle}>
                                {isFollowing ? 'Unfollow' : 'Follow'}
                            </button>
                            <button onClick={() => router.push(`/chat/${user._id}`)}>Chat</button>
                        </div>
                    )}
                </div>

                <div className={styles.tabSelector}>
                    {<button className={selectedTab === 'trips' ? styles.activeTab : ''} onClick={() => setSelectedTab('trips')}>Trips</button>}
                    <button className={selectedTab === 'posts' ? styles.activeTab : ''} onClick={() => setSelectedTab('posts')}>Posts</button>
                    <button className={selectedTab === 'reviews' ? styles.activeTab : ''} onClick={() => setSelectedTab('reviews')}>Reviews</button>
                </div>

                {selectedTab === 'trips' && (
                <div className={styles.trips}>
                    <h3 className={styles.sectionTitle}>My Trips</h3>
                    {trips.length > 0 ? (
                        trips.map((trip) => (
                            <div key={trip._id} className={styles.trip}>
                                <Link href={`/trip?tripId=${trip._id}&myTrip=true`}>
                                    <div className={styles.tripDetails}>
                                        <h4 className={styles.tripName}>{trip.name}</h4>
                                        <p className={styles.tripDate}>Start: {new Date(trip.startDate).toLocaleDateString()}</p>
                                        <p className={styles.tripDate}>End: {new Date(trip.endDate).toLocaleDateString()}</p>
                                        <p className={styles.tripCity}>City: {trip.city}</p>
                                    </div>
                                </Link>
                                {/* <button onClick={(e) => {
                                    e.stopPropagation();
                                    handleReviewClick(trip._id);
                                }}>
                                    Review this trip
                                </button> */}
                            </div>
                        ))
                    ) : (
                        <p>No trips available.</p>
                    )}
                </div>
            )}

                {selectedTab === 'posts' && (
                    <div className={styles.posts}>
                        <h3 className={styles.sectionTitle}>My Posts</h3>
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <Post key={post.id} post={post} isCurrentUser={isCurrentUser} />
                            ))
                        ) : (
                            <p>No posts available.</p>
                        )}
                    </div>
                )}

                {selectedTab === 'reviews' && (
                    <div className={styles.reviews}>
                        <h3 className={styles.sectionTitle}>My Reviews</h3>
                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <div key={review.id} className={styles.review}>
                                    <p className={styles.reviewText}>{review.text}</p>
                                    <p className={styles.reviewDate}>Posted on: {new Date(review.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))
                        ) : (
                            <p>No reviews available.</p>
                        )}
                    </div>
                )}

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

                {showProfileModal && (
                    <Modal onClose={handleCloseProfileModal}>
                        <img className={styles.largeProfilePicture} src={user.profilePicture} alt="Profile" />
                    </Modal>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
