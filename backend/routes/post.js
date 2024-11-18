const express = require('express');
const router = express.Router();

const {
    createPost,
    addMedia,
    getAllUserPosts,
    getSingleUserPost,
    updatePost,
    deletePost,
    likePost
} = require('../controllers/post');

router.post('/createPost', createPost)
router.post('/addMedia', addMedia)
router.get('/getAllUserPosts/:id', getAllUserPosts)
router.get('/getSingleUserPost/:userId/:postId', getSingleUserPost)
router.patch('/updatePost/:id', updatePost)
router.delete('/deletePost/:id', deletePost)
router.post('/likePost', likePost)

module.exports = router;