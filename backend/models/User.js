const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const UserSchema = new mongoose.Schema({
    firstName: {
      type: String,
      required: [true, 'Please provide first name'],
      maxlength: [20, 'firstName must be at most 20 characters long'],
      minlength: [2, 'firstName must be at least 2 characters long'],
    },
    lastName: {
      type: String,
      required: [true, 'Please provide last name'],
      maxlength: [20, 'lastName must be at most 20 characters long'],
      minlength: [2, 'lastName must be at least 2 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      match: [
         /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
         'Please provide a valid email',
      ],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters long'],
      match: [
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/,
        'Password must contain at least one digit, one lowercase letter, and one uppercase letter.',
      ]
    },
    username: {
      type: String,
      required: [true, 'Please provide username'],
      minlength: [6, 'Username must be at least 6 characters long'],
      maxlength: [20, 'Username must be at most 20 characters long'],
      unique: true,
      match: [
        /^[a-zA-Z0-9]+$/,
        'Please provide a valid username! Only letters and numbers are allowed.',
      ]
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please provide phone number'],
      match: [
        /^(\+20|0)?1[0125][0-9]{8}$/,
        'Please provide a valid phone number!',
      ],
      unique: true
    },
    gender: {
      type: String,
      enum: ['Male', 'Female'],
      required: [true, 'Please provide gender']
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Please provide date of birth'],
      validate: {
          validator: function(v) {
              return !isNaN(Date.parse(v)) && v < new Date();
          },
          message: props => `${props.value} is not a valid date of birth!`
      }
    },
    role: {
      type: String,
      enum: ['User', 'Admin'],
      default: 'User',
      required: true
    },
    followers: [{
      type: mongoose.Types.ObjectId,
      ref: 'User'
    }],
    following: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }],
    profilePicture: {
      type: String
    },
    verificationToken: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    verified: Date,
    traits: [{
      type: String,
      enum: [ 'Active', "Relaxed", 'Camping', 'Hiking', 'Sea', 'Cultural',
              'Historic', 'Adventurous', 'Indoor', 'Completionist', "Nature Lover", "Foodie", "Night Owl", "Early Riser", "Planner", "Spontaneous", "Budget Traveler",
              "Luxury Traveler", "Solo Traveler", "Group Traveler", "Family Traveler", "Romantic Getaway Seeker", "Backpacker", "Business Traveler", "Outdoor Activities",
              "Water Activities", "Arts and Culture", "Shopping", "Sports", "Learning", "Socializing", "Escapism", "Discovery", "Volunteerism",
              "Pet-Friendly Travel", "Accessibility Needs", "Urban", "Rural", "Coastal", "Mountainous", "Tropical", "Desert",
              "Modern Cities", "Vegetarian", "Vegan", "Gluten-Free", "Local Cuisine", "International Cuisine", "Street Food", "Fine Dining" ]
    }],
    bio: {
      type: String,
      maxlength: [300, 'bio must be at most 300 characters long']
    },
    passwordToken: {
      type: String,
    },
    passwordTokenExpirationDate: {
      type: Date,
    },
    trips: [{
      type: mongoose.Types.ObjectId,
      ref: 'Trip'
    }],
})

UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

UserSchema.methods.createJWT = function () {
    return jwt.sign(
        { userId: this._id, role: this.role },
        process.env.JWT_SECRET,
        {
        expiresIn: process.env.JWT_LIFETIME,
        }
    )
}

UserSchema.methods.comparePassword = async function (canditatePassword) {
    const isMatch = await bcrypt.compare(canditatePassword, this.password)
    return isMatch
}


module.exports = mongoose.model('User', UserSchema)