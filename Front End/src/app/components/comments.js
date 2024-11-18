import React, { useState } from 'react';
import styles from '../styles/Comment.module.css'; // Import CSS module for styling the Comment component
import Modal from './Modal'; // Adjust this import based on your Modal component path

const Comment = ({ comment, isCurrentUser, handleDeleteComment }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };

    const handleConfirmDelete = () => {
        setShowDeleteModal(true);
    };

    const handleDeleteConfirmed = () => {
        handleDeleteComment(comment._id);
        setShowDeleteModal(false);
    };

    const handleDeleteCanceled = () => {
        setShowDeleteModal(false);
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

    return (
        <li className={styles.comment}>
            <img className={styles.avatar} src={comment.profilePicture} alt="User Avatar" />
            <div className={styles.commentBody}>
                <span className={styles.username}>{comment.username}</span>
                <span className={styles.text}>{comment.text}</span>
                <span className={styles.date}>{timeAgo(comment.createdAt)}</span>
                {isCurrentUser && (
                    <div className={styles.menuWrapper}>
                        <button className={styles.menuButton} onClick={toggleMenu}>⋮</button>
                        {showMenu && (
                            <div className={styles.menu}>
                                <button onClick={handleConfirmDelete}>Delete</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showDeleteModal && (
                <Modal onClose={handleDeleteCanceled}>
                    <div className={styles.modalContent}>
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete this comment?</p>
                        <button onClick={handleDeleteConfirmed} className={styles.confirmButton}>Yes</button>
                        <button onClick={handleDeleteCanceled} className={styles.cancelButton}>No</button>
                    </div>
                </Modal>
            )}
        </li>
    );
};

export default Comment;
