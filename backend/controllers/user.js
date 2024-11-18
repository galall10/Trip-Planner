const User = require('../models/User');
const Post = require('../models/Post');
const Review = require('../models/Review');
const {StatusCodes} = require('http-status-codes');
const {BadRequestError,NotFoundError} = require('../errors');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const updateUser = async (req, res) => {
    const {
      user: { userId }
    } = req
    if(req.files){
        const profilePicture = await cloudinary.uploader.upload(
            req.files.image.tempFilePath,
            {
              use_filename: true,
              folder: 'User',
            }
        )
        fs.unlinkSync(req.files.image.tempFilePath)
        req.body.profilePicture = profilePicture.secure_url
    }
    const user = await User.findByIdAndUpdate(
        userId,
        req.body,
        { new: true, runValidators: true }
      )
    if (!user) {
      throw new NotFoundError(`No user with id ${userId}`)
    }
    res.status(StatusCodes.OK).json({ user })
}

const getUser = async (req, res) => {
    const {
        params: { id:userId },
    } = req
    const user = await User.findById(userId)
    .populate('followers','username profilePicture')
    .populate('following','username profilePicture')
    if (!user) {
        throw new NotFoundError(`No post with id ${userId}`)
    }
    res.status(StatusCodes.OK).json({ user })
}

const deleteUser = async (req, res) => {
    const {
        user: { userId },
    } = req
    const user = await User.findOneAndRemove(userId)
    if (!user) {
        throw new NotFoundError(`No user with id ${userId}`)
    }
    res.status(StatusCodes.OK).send(`User deleted!`)
}

const followUser = async (req, res) => {
    const {
        user: { userId },
        body: { id: targetUserId },
    } = req
    if(!targetUserId) {
        throw new BadRequestError('No id provided!')
    }
    if(targetUserId === userId) {
        throw new BadRequestError('You cant follow yourself!')
    }
    const user = await User.findById(userId)
    const targetUser = await User.findById(targetUserId)
    if (!user || !targetUser) {
        throw new NotFoundError(`No user with id ${targetUserId}`)
    }
     const isFollowing = user.following.includes(targetUserId)
    if (isFollowing) {
        user.following.pull(targetUserId)
        targetUser.followers.pull(userId)
     } else {
        user.following.push(targetUserId)
        targetUser.followers.push(userId)
     }
    await user.save()
    await targetUser.save()
    res.status(StatusCodes.OK).json({ user, targetUser })
}

const searchUsers = async (req, res) => {
    const {query} = req.query
    if(!query) {
        throw new BadRequestError('No query provided!')
    }
    const parts = query.split(' ');
    let searchCriteria;
    if (parts.length === 1) {
      searchCriteria = {
        $or: [
          { firstName: new RegExp(query, 'i') },
          { lastName: new RegExp(query, 'i') },
          { username: new RegExp(query, 'i') },
        ],
      };
    } else if (parts.length === 2) {
      searchCriteria = {
        $or: [
          { 
            firstName: new RegExp(parts[0], 'i'),
            lastName: new RegExp(parts[1], 'i')
          },
          { 
            firstName: new RegExp(parts[1], 'i'),
            lastName: new RegExp(parts[0], 'i')
          }
        ],
      };
    } else {
      searchCriteria = {
        $and: parts.map(part => ({
          $or: [
            { firstName: new RegExp(part, 'i') },
            { lastName: new RegExp(part, 'i') }
          ]
        }))
      };
    }
    const users = await User.find(searchCriteria);
    res.status(StatusCodes.OK).json({ users })
}

const getHomePage = async (req, res) => {
  const user = await User.findById(req.user.userId).populate('following').exec();
  if (!user) {
    throw new Error('User not found');
  }
  const followingUserIds = user.following.map(followedUser => followedUser._id);
  const posts = await Post.find({ createdBy: { $in: followingUserIds } })
    .populate('likes', 'username profilePicture firstName lastName')
    .populate('comments', 'username profilePicture createdAt text')
    .populate('createdBy', 'username profilePicture')
    .sort('-createdAt')
    .exec();
  const reviews = await Review.find({ createdBy: { $in: followingUserIds } })
    .populate('likes', 'username profilePicture firstName lastName')
    .populate('comments', 'username profilePicture createdAt text')
    .populate('createdBy', 'username profilePicture')
    .populate('trip', 'name city startDate endDate')
    .sort('-createdAt')
    .exec();
  const feed = [...posts, ...reviews].sort((a, b) => b.createdAt - a.createdAt);
  res.status(StatusCodes.OK).json({ posts: feed });
}

module.exports = {
    updateUser,
    getUser,
    deleteUser,
    followUser,
    searchUsers,
    getHomePage
}