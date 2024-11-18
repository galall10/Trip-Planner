const mongoose = require('mongoose');


const TripSchema = new mongoose.Schema({
    itinerary:{
        type: String,
        required: [true, 'Please provide itinerary'],
    },
    name:{
        type: String,
        required: [true, 'Please provide name'],
        maxlength: [100, 'name must be at most 100 characters long']
    },
    city:{
        type: String,
        required: [true, 'Please provide city'],
        maxlength: [40, 'city must be at most 40 characters long']
    },
    createdBy:{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    startDate:{
        type: Date,
        required: [true, 'Please provide startDate']
    },
    endDate:{
        type: Date,
        required: [true, 'Please provide endDate']
    },
    visibility: {
        type: String,
        enum: ['Private', 'Public'],
        required: [true, 'Please provide visibility']
    },
    companions: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }],
    reviews: [{
        type: mongoose.Types.ObjectId,
        ref: 'Review'
    }],
    likes: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }],
},{ timestamps: true })


module.exports = mongoose.model('Trip', TripSchema)