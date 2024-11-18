const express = require('express');
const router = express.Router();

const {
    updateUser,
    getUser,
    deleteUser,
    followUser,
    searchUsers,
    getHomePage
} = require('../controllers/user');


router.patch('/updateUser', updateUser)
router.get('/getUser/:id', getUser)
router.delete('/deleteUser', deleteUser)
router.post('/followUser', followUser)
router.get('/searchUsers', searchUsers)
router.get('/getHomePage', getHomePage)


module.exports = router;