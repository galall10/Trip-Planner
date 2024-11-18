const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const AgencySchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Please provide name'],
      maxlength: [30, 'name must be at most 30 characters long'],
      minlength: [2, 'name must be at least 2 characters long'],
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
    profilePicture: {
      type: String,
      required: [true, 'Please provide profile picture']
    }
},{ timestamps: true })

AgencySchema.pre('save', async function () {
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

AgencySchema.methods.createJWT = function () {
  return jwt.sign(
      { userId: this._id, role:'Agency' },
      process.env.JWT_SECRET,
      {
      expiresIn: process.env.JWT_LIFETIME,
      }
  )
}

AgencySchema.methods.comparePassword = async function (canditatePassword) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password)
  return isMatch
}

module.exports = mongoose.model('Agency', AgencySchema)