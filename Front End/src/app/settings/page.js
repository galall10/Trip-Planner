"use client"
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal'; // Assuming you have a Modal component
import styles from '../styles/GeneralSettings.module.css'; // Import CSS module for styling

const GeneralSettings = () => {
    const [showDeleteAccount, setShowDeleteAccount] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const router = useRouter();

    const handleDeleteAccount = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/v1/user/deleteUser', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete account');
            }

            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setSuccess('Account deleted successfully');
            setTimeout(() => {
                router.push('/home'); // Redirect to the sign-in page
            }, 2000);
        } catch (error) {
            setError(error.message);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/v1/auth/changePassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ oldPassword, newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.msg === 'Invalid credentials') {
                    setError('Old password is incorrect');
                } else {
                    throw new Error(data.msg || 'Failed to change password');
                }
                return;
            }

            setSuccess('Password changed successfully');
            setError('');
        } catch (error) {
            setError(error.message);
            setSuccess('');
        }
    };

    const handleShowDeleteModal = () => {
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
    };

    const handleDeleteAccountConfirmation = () => {
        setShowDeleteModal(false);
        handleDeleteAccount();
    };

    const handleToggleDeleteAccount = () => {
        setShowDeleteAccount(!showDeleteAccount);
        setShowChangePassword(false);
    };

    const handleToggleChangePassword = () => {
        setShowChangePassword(!showChangePassword);
        setShowDeleteAccount(false);
    };

    return (
        <div className={styles.page}>
            <Sidebar />
            <div className={styles.container}>
                <h2 className={styles.title}>General Settings</h2>
                <div className={styles.menu}>
                    <button className={styles.menuButton} onClick={handleToggleDeleteAccount}>
                        Delete Account
                    </button>
                    {showDeleteAccount && (
                        <div className={styles.menuContent}>
                            <button className={styles.deleteButton} onClick={handleShowDeleteModal}>
                                Confirm Delete Account
                            </button>
                        </div>
                    )}
                </div>
                <div className={styles.menu}>
                    <button className={styles.menuButton} onClick={handleToggleChangePassword}>
                        Change Password
                    </button>
                    {showChangePassword && (
                        <form className={styles.menuContent} onSubmit={handleChangePassword}>
                            <input
                                type="password"
                                placeholder="Old Password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                required
                                className={styles.input}
                            />
                            <input
                                type="password"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className={styles.input}
                            />
                            <input
                                type="password"
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className={styles.input}
                            />
                            <button type="submit" className={styles.submitButton}>
                                Change Password
                            </button>
                        </form>
                    )}
                </div>
                {error && <p className={styles.error}>{error}</p>}
                {success && <p className={styles.success}>{success}</p>}

                {showDeleteModal && (
                    <Modal onClose={handleCloseDeleteModal}>
                        <div className={styles.modalContent}>
                            <h3>Are you sure you want to delete this account?</h3>
                            <p>Upon deletion, this account cannot be retrieved again.</p>
                            <button onClick={handleDeleteAccountConfirmation} className={styles.confirmButton}>
                                Yes
                            </button>
                            <button onClick={handleCloseDeleteModal} className={styles.cancelButton}>
                                No
                            </button>
                        </div>
                    </Modal>
                )}
            </div>
        </div>
    );
};

export default GeneralSettings;
