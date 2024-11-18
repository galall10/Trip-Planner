import React, { useState, useEffect } from 'react';
import Comment from './comments'; // Assuming you have a Comment component
import Modal from './Modal'; // Assuming you have a Modal component
import styles from '../styles/Posts.module.css'; // Import CSS module for styling

const Post = ({ post, isCurrentUser }) => {
    const [likes, setLikes] = useState(post.likes.length);
    const [isLiked, setIsLiked] = useState(false);
    const [comments, setComments] = useState(post.comments);
    const [newComment, setNewComment] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [showLikesModal, setShowLikesModal] = useState(false); // State to control likes modal
    const [likedBy, setLikedBy] = useState([]); // State for liked users
    const [visibleComments, setVisibleComments] = useState(2); // State for visible comments, default 2
    const [showAllComments, setShowAllComments] = useState(false); // State to track showing all comments or not

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (post.likes.some(like => like._id === currentUser._id)) {
            setIsLiked(true);
        } else {
            setIsLiked(false);
        }
        setLikedBy(post.likes); // Set likedBy state with post likes
    }, [post.likes]);

    const handleLike = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/v1/post/likePost', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ id: post._id })
            });

            if (!response.ok) {
                throw new Error('Failed to like/unlike post');
            }

            if (isLiked) {
                setLikes(likes - 1);
                setLikedBy(likedBy.filter(user => user._id !== JSON.parse(localStorage.getItem('user'))._id));
            } else {
                setLikes(likes + 1);
                setLikedBy([...likedBy, JSON.parse(localStorage.getItem('user'))]);
            }
            setIsLiked(!isLiked);
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleCommentChange = (e) => {
        setNewComment(e.target.value);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (newComment.trim()) {
            try {
                const response = await fetch('http://localhost:5000/api/v1/comment/createPostComment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ text: newComment, id: post._id })
                });

                if (!response.ok) {
                    throw new Error('Failed to post comment');
                }

                const data = await response.json();
                setComments([...comments, data.comment]);
                setNewComment('');
            } catch (error) {
                console.error(error.message);
            }
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/v1/comment/deletePostComment/${post._id}/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete comment');
            }

            setComments(comments.filter(comment => comment._id !== commentId));
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleToggleComments = () => {
        setShowAllComments(!showAllComments);
    };

    const timeAgo = (date) => {
        const now = new Date();
        const past = new Date(date);
        const seconds = Math.floor((now - past) / 1000);
    
        let interval = Math.floor(seconds / 31536000);
        if (interval > 1) return `${interval} years ago`;
    
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) return `${interval} months ago`;
    
        interval = Math.floor(seconds / 86400);
        if (interval > 1) return `${interval} days ago`;
    
        interval = Math.floor(seconds / 3600);
        if (interval > 1) return `${interval} hours ago`;
    
        interval = Math.floor(seconds / 60);
        if (interval > 1) return `${interval} minutes ago`;
    
        return "just now";
    };

    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };

    const handleDeletePost = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/v1/post/deletePost/${post._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete post');
            }

            // Optionally remove the post from the UI here, depending on your state management
            console.log('Post deleted successfully');
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleShowLikesModal = () => {
        setShowLikesModal(true);
    };

    const handleCloseLikesModal = () => {
        setShowLikesModal(false);
    };

    const handleUserClick = (userId) => {
        window.location.href = `/profile?userId=${userId}`;
    };

    return (
        <div className={styles.post}>
            <div className={styles.header}>
                <img className={styles.avatar} src={post.createdBy.profilePicture} alt="User Avatar" />
                <div>
                    <span className={styles.username}>{post.createdBy.username}</span>
                    <span className={styles.location}>{post.location}</span>
                    <span className={styles.date}>{timeAgo(post.createdAt)}</span>
                </div>
                {isCurrentUser && (
                    <div className={styles.menuWrapper}>
                        <button className={styles.menuButton} onClick={toggleMenu}>⋮</button>
                        {showMenu && (
                            <div className={styles.menu}>
                                <button onClick={handleDeletePost}>Delete</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className={styles.media}>
                {post.media.map((mediaUrl, index) => (
                    <img key={index} className={styles.mediaContent} src={mediaUrl} alt="Post Media" />
                ))}
            </div>
            <div className={styles.body}>
                <p className={styles.caption}>{post.caption}</p>
                <div className={styles.actions}>
                    <button
                        className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
                        onClick={handleLike}
                    >
                        ❤️ {likes}
                    </button>
                    <button className={styles.viewLikesButton} onClick={handleShowLikesModal}>View Likes</button>
                </div>
                <div className={styles.commentsSection}>
                    <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
                        <input
                            type="text"
                            value={newComment}
                            onChange={handleCommentChange}
                            className={styles.commentInput}
                            placeholder="Add a comment..."
                        />
                        <button type="submit" className={styles.commentButton}>Post</button>
                    </form>
                    <ul className={styles.commentsList}>
                        {comments.slice(0, showAllComments ? comments.length : visibleComments).map((comment) => (
                            <Comment
                                key={comment._id}  // Assuming _id is unique for each comment
                                comment={comment}
                                isCurrentUser={isCurrentUser}
                                handleDeleteComment={handleDeleteComment}
                            />
                        ))}
                        {comments.length > visibleComments && (
                            <button className={styles.loadMoreButton} onClick={handleToggleComments}>
                                {showAllComments ? 'Show less comments' : 'Load more comments'}
                            </button>
                        )}
                    </ul>
                </div>
            </div>
            {showLikesModal && (
                <Modal onClose={handleCloseLikesModal}>
                    <h3>Likes</h3>
                    {likedBy.length === 0 ? (
                        <p>No likes yet.</p>
                    ) : (
                        <ul className={styles.modalList}>
                            {likedBy.map(user => (
                                <li key={user._id} className={styles.modalListItem} onClick={() => handleUserClick(user._id)}>
                                    <img className={styles.modalProfilePicture} src={user.profilePicture} alt={user.username} />
                                    <div className={styles.modalUserInfo}>
                                        <p className={styles.modalUsername}>{user.username}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Modal>
            )}
        </div>
    );
};

export default Post;
