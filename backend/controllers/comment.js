const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Review = require('../models/Review');
const User = require('../models/User');
const {StatusCodes} = require('http-status-codes');
const {BadRequestError, NotFoundError} = require('../errors');

const createPostComment = async (req,res) => {
    const {
        body: { text, id: postId },
        user: { userId },
      } = req
    if(!postId) {
        throw new BadRequestError('No post id provided!')
    }
    const post1 = await Post.findById(postId)
    if(!post1) {
        throw new NotFoundError(`No post with id ${postId}`)
    }
    const user = await User.findById(userId)
    const comment = await Comment.create({createdBy: userId, text, profilePicture: user.profilePicture, username: user.username})
    const post = await Post.findByIdAndUpdate(
        postId,
        { $push: { comments: comment } },
        { new: true, runValidators: true }
    )
    res.status(StatusCodes.CREATED).json({ comment, post })
}

const createReviewComment = async (req,res) => {
    const {
        body: { text, id: reviewId },
        user: { userId },
      } = req
    if(!reviewId) {
        throw new BadRequestError('No review id provided')
    }
    const review1 = await Review.findById(reviewId)
    if(!review1) {
        throw new NotFoundError(`No review with id ${reviewId}`)
    }
    const user = await User.findById(userId)
    const comment = await Comment.create({createdBy: userId, text, profilePicture: user.profilePicture, username: user.username})
    const review = await Review.findByIdAndUpdate(
        reviewId,
        { $push: { comments: comment } },
        { new: true, runValidators: true }
    )
    res.status(StatusCodes.CREATED).json({ comment, review })
}

const createReply = async (req,res) => {
    const {
        body: { text, id: commentId },
        user: { userId },
      } = req
    if(!commentId) {
        throw new BadRequestError('No comment id provided')
    }
    const comment1 = await Comment.findById(commentId)
    if(!comment1) {
        throw new NotFoundError(`No comment with id ${commentId}`)
    }
    const reply = await Comment.create({createdBy: userId, text})
    const comment = await Comment.findByIdAndUpdate(
        commentId,
        { $push: { replies: reply } },
        { new: true, runValidators: true }
    )
    res.status(StatusCodes.CREATED).json({ reply, comment })
}

const updateComment = async (req, res) => {
    const {
      body: { text },
      user: { userId },
      params: { id: commentId },
    } = req
    if(!text) {
        throw new BadRequestError('No text provided')
    }
    if (text === '') {
      throw new BadRequestError('Text cannot be empty')
    }
    const comment = await Comment.findByIdAndUpdate(
      { _id: commentId, createdBy: userId },
      req.body,
      { new: true, runValidators: true }
    )
    if (!comment) {
      throw new NotFoundError(`No comment with id ${commentId}`)
    }
    res.status(StatusCodes.OK).json({ comment })
}

const getComment = async (req, res) => {
    const {
        params: { id:commentId },
    } = req
    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new NotFoundError(`No comment with id ${commentId}`)
    }
    res.status(StatusCodes.OK).json({ comment })
}

const deletePostComment = async (req, res) => {
    const {
      user: { userId },
      params: { postId, commentId},
    } = req
    const comment = await Comment.findOneAndRemove({
      _id: commentId,
      createdBy: userId,
    })
    if (!comment) {
      throw new NotFoundError(`No comment with id ${commentId}`)
    }
    const post = await Post.findByIdAndUpdate(
        postId,
        { $pull: { comments: commentId } },
        { new: true, runValidators: true }
    )
    if (!post) {
        throw new NotFoundError(`No post with id ${postId}`)
    }
    res.status(StatusCodes.OK).json({ post })
}
const deleteReviewComment = async (req, res) => {
    const {
      user: { userId },
      params: { reviewId, commentId},
    } = req
    const comment = await Comment.findOneAndRemove({
      _id: commentId,
      createdBy: userId,
    })
    if (!comment) {
      throw new NotFoundError(`No comment with id ${commentId}`)
    }
    const review = await Review.findByIdAndUpdate(
        reviewId,
        { $pull: { comments: commentId } },
        { new: true, runValidators: true }
    )
    if (!review) {
        throw new NotFoundError(`No review with id ${reviewId}`)
    }
    res.status(StatusCodes.OK).json({ review })
}
const deleteReply = async (req, res) => {
    const {
      user: { userId },
      params: { commentId, replyId },
    } = req
    const reply = await Comment.findOneAndRemove({
      _id: replyId,
      createdBy: userId,
    })
    if (!reply) {
      throw new NotFoundError(`No reply with id ${replyId}`)
    }
    const comment = await Comment.findByIdAndUpdate(
        commentId,
        { $pull: { replies: replyId } },
        { new: true, runValidators: true }
    )
    if (!comment) {
        throw new NotFoundError(`No post with id ${commentId}`)
    }
    res.status(StatusCodes.OK).json({ comment })
}

module.exports = {
    createPostComment,
    createReviewComment,
    createReply,
    updateComment,
    getComment,
    deletePostComment,
    deleteReviewComment,
    deleteReply
}