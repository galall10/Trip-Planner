const express = require('express');
const router = express.Router();

const {createReview,
    addMedia,
    getAllUserReviews,
    getSingleUserReview,
    updateReview,
    deleteReview,
    likeReview
} = require('../controllers/review');

router.post('/createReview', createReview)
router.post('/addMedia', addMedia)
router.get('/getAllUserReviews/:id', getAllUserReviews)
router.get('/getSingleUserReview/:userId/:reviewId', getSingleUserReview)
router.patch('/updateReview/:id', updateReview)
router.delete('/deleteReview/:reviewId/:tripId', deleteReview)
router.post('/likeReview', likeReview)


module.exports = router;