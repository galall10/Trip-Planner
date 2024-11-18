const Trip = require('../models/Trip');
const User = require('../models/User');
const {StatusCodes} = require('http-status-codes');
const {BadRequestError, NotFoundError} = require('../errors');


const createTrip = async (req,res) => {
  req.body.createdBy = req.user.userId
  const trip = await Trip.create(req.body)
  .populate('companions','username profilePicture')
  .populate('likes' , 'username profilePicture')
  .populate('createdBy' , 'username profilePicture');
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { $push: { trips: trip } },
    { new: true, runValidators: true }
  );
  res.status(StatusCodes.CREATED).json({ trip })
}

const followTrip = async (req, res) => {
  const {
    user: { userId },
    body: { id: tripId }
  } = req;
  if (!tripId) {
    throw new BadRequestError(`Please provide trip id`);
  }
  const trip = await Trip.findOne({
    _id: tripId,
    visibility: 'Public'
  }).populate('companions','username profilePicture')
  .populate('likes' , 'username profilePicture')
  .populate('createdBy' , 'username profilePicture')
  if (!trip) {
    throw new NotFoundError(`No trip with id ${tripId}`);
  }
  const user = await User.findById(userId);
  const tripIndex = user.trips.indexOf(tripId);
  if (tripIndex === -1) {
    user.trips.push(tripId);
    trip.companions.push(userId);
  } else {
    trip.companions.splice(trip.companions.indexOf(userId), 1);
    user.trips.splice(tripIndex, 1);
  }
  await trip.save();
  await user.save();
  res.status(StatusCodes.OK).json({ user, trip });
}

const deleteTrip = async (req, res) => {
  const {
    user: { userId },
    params: { id: tripId },
  } = req
  if(!tripId) {
    throw new BadRequestError(`Please provide trip id`)
  }
  const trip = await Trip.findOneAndRemove({
    _id: tripId,
    createdBy: userId,
  })
  if (!trip) {
    throw new NotFoundError(`No trip with id ${tripId}`)
  }
  res.status(StatusCodes.OK).json({msg: "Trip deleted"})
}

const getTrip = async (req, res) => {
  const {
    params: { id: tripId },
  } = req
  if(!tripId) {
    throw new BadRequestError(`Please provide trip id`)
  }
  const trip = await Trip.findOne({
      _id: tripId,
  }).populate('companions','username profilePicture')
  .populate('likes' , 'username profilePicture')
  .populate('createdBy' , 'username profilePicture')
  if (!trip) {
      throw new NotFoundError(`No trip with id ${tripId}`)
  }
  res.status(StatusCodes.OK).json({ trip })
}

const getMyTrip = async (req, res) => {
  const {
    params: { id: tripId },
    user: { userId }
  } = req
  if(!tripId) {
    throw new BadRequestError(`Please provide trip id`)
  }
  const trip = await Trip.findOne({
      _id: tripId,
      createdBy: userId
  }).populate('companions','username profilePicture')
  .populate('likes' , 'username profilePicture')
  .populate('createdBy' , 'username profilePicture')
  if (!trip) {
      throw new NotFoundError(`No trip with id ${tripId}`)
  }
  res.status(StatusCodes.OK).json({ trip })
}

const getAllUserTrips = async (req, res) => {
  const {
    params: { id }
  } = req
  const user = await User.findById(id).populate({
    path: 'trips',
    populate: [
      { path: 'companions', select: 'username profilePicture' },
      { path: 'likes', select: 'username profilePicture' },
      { path: 'createdBy', select: 'username profilePicture'}
    ]
  });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const { trips } = user;
  res.status(StatusCodes.OK).json({ trips });
}

const getAllMyTrips = async (req, res) => {
  const {
    user: { userId }
  } = req
  const user = await User.findById(userId).populate({
    path: 'trips',
    populate: [
      { path: 'companions', select: 'username profilePicture' },
      { path: 'likes', select: 'username profilePicture' },
      { path: 'createdBy', select: 'username profilePicture' }
    ]
  });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const { trips } = user;
  res.status(StatusCodes.OK).json({ trips });
}

const discover = async (req, res) => {
  const {
    user: { userId }
  } = req
  
}

const likeTrip = async (req, res) => {
  const {
    user: { userId },
    body: { id: tripId },
  } = req
  const trip = await Trip.findById(tripId)
  if (!trip) {
    throw new NotFoundError(`No trip with id ${tripId}`)
  }
  const userIndex = trip.likes.indexOf(userId);
  if (userIndex === -1) {
    trip.likes.push(userId);
  } else {
    trip.likes.splice(userIndex, 1);
  }
  await trip.save();
  res.status(StatusCodes.OK).json({likes: trip.likes})
}

const updateTrip = async (req, res) => {
  const {
    user: { userId },
    params: { id: tripId },
  } = req
  const trip = await Trip.findByIdAndUpdate(
    { _id: tripId, createdBy: userId },
    req.body,
    { new: true, runValidators: true }
  ).populate('companions','username profilePicture')
  .populate('likes' , 'username profilePicture')
  .populate('createdBy' , 'username profilePicture')
  if (!trip) {
    throw new NotFoundError(`No trip with id ${tripId}`)
  }
  res.status(StatusCodes.OK).json({ trip })
}

module.exports = {
    createTrip,
    deleteTrip,
    getTrip,
    getAllUserTrips,
    followTrip,
    getMyTrip,
    getAllMyTrips,
    likeTrip,
    updateTrip
}