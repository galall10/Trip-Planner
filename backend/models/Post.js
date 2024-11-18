const mongoose = require('mongoose');


const PostSchema = new mongoose.Schema({
    caption: {
        type: String,
        trim: true,
        maxlength: [1000, 'caption must be at most 200 characters long']
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
    comments: [{
        type: mongoose.Types.ObjectId,
        ref: 'Comment'
    }],
    location: {
        type: String,
        minlength: [2, 'location must be at least 2 characters long'],
        maxlength: [100, 'location must be at most 100 characters long']
    }
},{ timestamps: true })


module.exports = mongoose.model('Post', PostSchema)