const Post = require('../models/Post');
const {StatusCodes} = require('http-status-codes');
const {BadRequestError, UnauthenticatedError, NotFoundError} = require('../errors');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const User = require('../models/User');

const createPost = async (req,res) => {
    req.body.createdBy = req.user.userId
    const post = await Post.create(req.body)
    res.status(StatusCodes.CREATED).json({ post })
}

const addMedia = async (req, res) => {
    const postId = req.body.id
    const post1 = await Post.findById(postId)
    if(post1.createdBy != req.user.userId) {
        throw new UnauthenticatedError(`Unauthorized!`)
    }
    if(!req.files){
        throw new BadRequestError(`No picture provided`)
    }
    if(!postId){
      throw new BadRequestError(`No post id provided`)
    }
    const pic = await cloudinary.uploader.upload(
      req.files.image.tempFilePath,
      {
      use_filename: true,
      folder: 'Post',
      }
    )
    fs.unlinkSync(req.files.image.tempFilePath)
    const post = await Post.findByIdAndUpdate(
        postId,
      { $push: { media: pic.secure_url } },
      { new: true, runValidators: true }
    )
    if (!post) {
      throw new NotFoundError(`No post with id ${postId}`)
    }
    res.status(StatusCodes.OK).json({ post })
}

const getAllUserPosts = async (req,res) => {
    const posts = await Post.find({ createdBy: req.params.id })
    .populate('likes','username profilePicture firstName lastName')
    .populate('comments','username profilePicture createdAt text')
    .populate('createdBy','username profilePicture')
    .sort('-createdAt')
    res.status(StatusCodes.OK).json({ posts, count: posts.length })
}

const getSingleUserPost = async (req,res) => {
    const {
        params: { postId , userId },
    } = req
    const post = await Post.findOne({
        _id: postId,
        createdBy: userId,
    })
    if (!post) {
        throw new NotFoundError(`No post with id ${postId}`)
    }
    res.status(StatusCodes.OK).json({ post })
}

const updatePost = async (req, res) => {
    const {
      body: { caption },
      user: { userId },
      params: { id: postId },
    } = req
    if(!caption) {
        throw new BadRequestError('No caption provided')
    }
    if (caption === '') {
      throw new BadRequestError('Caption cannot be empty')
    }
    const post = await Post.findByIdAndUpdate(
      { _id: postId, createdBy: userId },
      req.body,
      { new: true, runValidators: true }
    )
    if (!post) {
      throw new NotFoundError(`No post with id ${postId}`)
    }
    res.status(StatusCodes.OK).json({ post })
  }

const deletePost = async (req, res) => {
    const {
      user: { userId },
      params: { id: postId },
    } = req
    const post = await Post.findOneAndRemove({
      _id: postId,
      createdBy: userId,
    })
    if (!post) {
      throw new NotFoundError(`No post with id ${postId}`)
    }
    res.status(StatusCodes.OK).json({msg: "Post deleted"})
}

const likePost = async (req, res) => {
  const {
    user: { userId },
    body: { id: postId },
  } = req
  const post = await Post.findById(postId)
  if (!post) {
    throw new NotFoundError(`No post with id ${postId}`)
  }
  const userIndex = post.likes.indexOf(userId);
  if (userIndex === -1) {
    post.likes.push(userId);
  } else {
    post.likes.splice(userIndex, 1);
  }
  await post.save();
  res.status(StatusCodes.OK).json({likes: post.likes})
}


module.exports = {
    createPost,
    addMedia,
    getAllUserPosts,
    getSingleUserPost,
    updatePost,
    deletePost,
    likePost
}