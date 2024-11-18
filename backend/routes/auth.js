const express = require('express');
const router = express.Router();

const {
    login,
    register,
    registerAgency,
    verifyEmail,
    changePassword,
    resetPassword,
    forgetPassword
} = require('../controllers/auth');

const {authenticateUser} = require('../middleware/authentication');

router.post('/register', register)
router.post('/login', login)
router.post('/registerAgency', registerAgency)
router.post('/verifyEmail', verifyEmail);
router.post('/changePassword', authenticateUser, changePassword);
router.post('/resetPassword', resetPassword);
router.post('/forgetPassword', forgetPassword);

module.exports = router;