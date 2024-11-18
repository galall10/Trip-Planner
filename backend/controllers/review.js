const Review = require('../models/Review');
const User = require('../models/User');
const Trip = require('../models/Trip');
const {StatusCodes} = require('http-status-codes');
const {BadRequestError, UnauthenticatedError, NotFoundError} = require('../errors');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const createReview = async (req,res) => {
  try{
  const {
      body: { text, id: tripId, rating },
      user: { userId },
    } = req
  if(!tripId) {
      throw new BadRequestError('No trip id provided!')
  }
  const trip1 = await Trip.findById(tripId)
  if(!trip1) {
      throw new NotFoundError(`No trip with id ${tripId}`)
  }
  const user = await User.findById(userId)
  const review = await Review.create({createdBy: userId, text, profilePicture: user.profilePicture, username: user.username, rating, trip: tripId})
  const trip = await Trip.findByIdAndUpdate(
    tripId,
      { $push: { reviews: review } },
      { new: true, runValidators: true }
  )
  res.status(StatusCodes.CREATED).json({ review, trip })}catch(err) {console.error(err)}
}

const addMedia = async (req, res) => {
    const reviewId = req.body.id
    const review1 = await Review.findById(reviewId)
    if(review1.createdBy != req.user.userId) {
        throw new UnauthenticatedError(`Unauthorized!`)
    }
    if(!req.files){
        throw new BadRequestError(`No picture provided`)
    }
    if(!reviewId){
      throw new BadRequestError(`No post id provided`)
    }
    const pic = await cloudinary.uploader.upload(
      req.files.image.tempFilePath,
      {
      use_filename: true,
      folder: 'Review',
      }
    )
    fs.unlinkSync(req.files.image.tempFilePath)
    const review = await Review.findByIdAndUpdate(
        reviewId,
      { $push: { media: pic.secure_url } },
      { new: true, runValidators: true }
    )
    if (!review) {
      throw new NotFoundError(`No review with id ${reviewId}`)
    }
    res.status(StatusCodes.OK).json({ review })
}

const getAllUserReviews = async (req,res) => {
    const reviews = await Review.find({ createdBy: req.params.id })
    .populate('likes','username profilePicture firstName lastName')
    .populate('comments','username profilePicture createdAt text')
    .populate('createdBy','username profilePicture')
    .sort('-createdAt')
    res.status(StatusCodes.OK).json({ reviews, count: reviews.length })
}

const getSingleUserReview = async (req,res) => {
    const {
        params: { reviewId , userId },
    } = req
    const review = await Review.findOne({
        _id: reviewId,
        createdBy: userId,
    }).populate('likes','username profilePicture firstName lastName')
    .populate('comments','username profilePicture createdAt text')
    .populate('createdBy','username profilePicture')
    if (!review) {
        throw new NotFoundError(`No review with id ${reviewId}`)
    }
    res.status(StatusCodes.OK).json({ review })
}

const updateReview = async (req, res) => {
    const {
      body: { text },
      user: { userId },
      params: { id: reviewId },
    } = req
    if(!text) {
        throw new BadRequestError('No text provided!')
    }
    if (text === '') {
      throw new BadRequestError('Text cannot be empty')
    }
    const review = await Review.findByIdAndUpdate(
      { _id: reviewId, createdBy: userId },
      req.body,
      { new: true, runValidators: true }
    )
    if (!review) {
      throw new NotFoundError(`No review with id ${reviewId}`)
    }
    res.status(StatusCodes.OK).json({ review })
}

const deleteReview = async (req, res) => {
  const {
    user: { userId },
    params: { reviewId, tripId }
  } = req;
  const review = await Review.findOneAndRemove({
    _id: reviewId,
    createdBy: userId,
  });
  if (!review) {
    throw new NotFoundError(`No review with id ${reviewId}`);
  }
  await Trip.findByIdAndUpdate(tripId, {
    $pull: { reviews: reviewId },
  });
  res.status(StatusCodes.OK).json({msg : "Review deleted!"});
};

const likeReview = async (req, res) => {
  const {
    user: { userId },
    body: { id: reviewId },
  } = req
  const review = await Review.findById(reviewId)
  if (!review) {
    throw new NotFoundError(`No review with id ${reviewId}`)
  }
  const userIndex = review.likes.indexOf(userId);
  if (userIndex === -1) {
    review.likes.push(userId);
  } else {
    review.likes.splice(userIndex, 1);
  }
  await review.save();
  res.status(StatusCodes.OK).json({likes: review.likes})
}


module.exports = {
    createReview,
    addMedia,
    getAllUserReviews,
    getSingleUserReview,
    updateReview,
    deleteReview,
    likeReview
}