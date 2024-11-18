import React from 'react';
import styles from '../styles/Modal.module.css';

const Modal = ({ children, onClose }) => {
    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={onClose}>&times;</button>
                {children}
            </div>
        </div>
    );
};

export default Modal;
