const mongoose = require('mongoose');


const ReviewSchema = new mongoose.Schema({
    rating: {
        type: String,
        enum: ['1', '2', '3', '4', '5'],
        required: true
    },
    text: {
        type: String,
        required: [true, 'Please provide review text'],
        trim: true,
        maxlength: [1000, 'text must be at most 1000 characters long']
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user'],
    },
    likes: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }],
    media: [{
        type: String
    }],
    profilePicture: {
        type: String
    },
    username: {
        type: String
    },
    comments: [{
        type: mongoose.Types.ObjectId,
        ref: 'Comment'
    }],
    trip: {
        type: mongoose.Types.ObjectId,
        ref: 'Trip'
    },
},{ timestamps: true })


module.exports = mongoose.model('Review', ReviewSchema)