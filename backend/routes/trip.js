const express = require('express');
const router = express.Router();

const {
    createTrip,
    deleteTrip,
    getTrip,
    getAllUserTrips,
    followTrip,
    getMyTrip,
    getAllMyTrips,
    likeTrip,
    updateTrip
} = require('../controllers/trip');

router.post('/createTrip', createTrip)
router.post('/followTrip', followTrip)
router.delete('/deleteTrip/:id', deleteTrip)
router.get('/getTrip/:id', getTrip)
router.get('/getAllUserTrips/:id', getAllUserTrips)
router.get('/getMyTrip/:id', getMyTrip)
router.get('/getAllMyTrips', getAllMyTrips)
router.post('/likeTrip', likeTrip)
router.patch('/updateTrip/:id', updateTrip)

module.exports = router;