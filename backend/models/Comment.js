const mongoose = require('mongoose');


const CommentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Please provide text'],
        trim: true,
        maxlength: [300, 'text must be at most 300 characters long']
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user'],
    },
    replies: [{
        type: mongoose.Types.ObjectId,
        ref: 'Comment'
    }],
    profilePicture: {
        type: String
    },
    username: {
        type: String
    }
},{ timestamps: true })


module.exports = mongoose.model('Comment', CommentSchema)