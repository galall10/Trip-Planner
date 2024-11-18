const express = require('express');
const router = express.Router();

const {
    createPostComment,
    createReviewComment,
    createReply,
    updateComment,
    getComment,
    deletePostComment,
    deleteReviewComment,
    deleteReply
} = require('../controllers/comment');

router.post('/createPostComment', createPostComment)
router.post('/createReviewComment', createReviewComment)
router.post('/createReply', createReply)
router.patch('/updateComment/:id', updateComment)
router.get('/getComment/:id', getComment)
router.delete('/deletePostComment/:postId/:commentId', deletePostComment)
router.delete('/deleteReviewComment/:reviewId/:commentId', deleteReviewComment)
router.delete('/deleteReply/:commentId/:replyId', deleteReply)

module.exports = router;