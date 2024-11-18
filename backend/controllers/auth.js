const User = require('../models/User');
const {StatusCodes} = require('http-status-codes');
const {BadRequestError, UnauthenticatedError, NotFoundError} = require('../errors');
const {
    sendVerificationEmail,
    sendResetPasswordEmail,
    createHash,
  } = require('../utils');
const crypto = require('crypto');


const register = async (req,res) => {
    const verificationToken = crypto.randomBytes(40).toString('hex')
    req.body.verificationToken = verificationToken
    const isFirstAccount = (await User.countDocuments({})) === 0;
    const role = isFirstAccount ? 'Admin' : 'User'
    req.body.role = role
    if(req.body.gender === 'Male'){
        req.body.profilePicture = 'https://res.cloudinary.com/duecvmbvw/image/upload/v1719824514/man_loqlam.png'
    }else{
        req.body.profilePicture = 'https://res.cloudinary.com/duecvmbvw/image/upload/v1719824515/woman_gqdhzw.png'
    }
    const user = await User.create(req.body);
    const origin = 'http://localhost:3000';
    await sendVerificationEmail({
        name: user.firstName,
        email: user.email,
        verificationToken: user.verificationToken,
        origin,
    });
    const token = user.createJWT()
    res.status(StatusCodes.CREATED).json({token, user, msg: 'Success! Please check your email to verify account'});
}

const verifyEmail = async (req, res) => {
    const { token: verificationToken, email } = req.body;
    console.log(email,verificationToken)
    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthenticatedError('Verification Failed');
    }
    if (user.verificationToken !== verificationToken) {
      throw new UnauthenticatedError('Verification Failed');
    }
    (user.isVerified = true), (user.verified = Date.now());
    user.verificationToken = '';
    await user.save();
    res.status(StatusCodes.OK).json({ msg: 'Email Verified' });
}

const registerAgency = async (req,res) => {
    const agency = await Agency.create(req.body);
    const token = agency.createJWT()
    res.status(StatusCodes.OK).json({token});
}

const login = async (req, res) => {
    if(req.files){console.log('hehe')}
    const {usernameOrEmail,password} = req.body;
    if(!usernameOrEmail){
        throw new BadRequestError(`Please provide email or username`);
    }
    if(!password){
        throw new BadRequestError(`Please provide password`);
    }
    let user = null
    if (usernameOrEmail.includes('@')) {
        user = await User.findOne({ email: usernameOrEmail });
    } else {
        user = await User.findOne({ username: usernameOrEmail });
    }
    if(!user){
        throw new UnauthenticatedError(`Invalid credentials`);
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if(!isPasswordCorrect) {
        throw new UnauthenticatedError(`Invalid credentials`);
    }
    const token = user.createJWT();
    res.status(StatusCodes.OK).json({token, user});
}

const changePassword = async (req, res) => {
    const {
        body: { oldPassword, newPassword },
        user: { userId }
      } = req
    if(!oldPassword || !newPassword){
        throw new BadRequestError(`Please provide old password and new password`)
    }
    const user = await User.findById(userId)
    if(!user){
        throw new NotFoundError(`No user with id ${userId}`);
    }
    const isPasswordCorrect = await user.comparePassword(oldPassword);
    if(!isPasswordCorrect) {
        throw new UnauthenticatedError(`Invalid credentials`);
    }
    user.password = newPassword;
    await user.save();
    res.status(StatusCodes.OK).json({msg: 'Password updated successfully'})
}

const forgetPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
      throw new BadRequestError('Please provide valid email');
    }
    const user = await User.findOne({ email });
    if(!user){
        throw new NotFoundError(`No user with email ${email}`);
    }
    const passwordToken = crypto.randomBytes(70).toString('hex');
    const origin = 'http://localhost:3000';
    await sendResetPasswordEmail({
      name: user.firstName,
      email: user.email,
      token: passwordToken,
      origin,
    });
    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);
    user.passwordToken = createHash(passwordToken);
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    await user.save();
    res
      .status(StatusCodes.OK)
      .json({ msg: 'Please check your email for reset password link' });
}

const resetPassword = async (req, res) => {
    const { token, email, password } = req.body;
    if (!token || !email || !password) {
      throw new CustomError.BadRequestError('Please provide all values');
    }
    const user = await User.findOne({ email });
    if(!user){
        throw new NotFoundError(`No user with email ${email}`);
    }
    const currentDate = new Date();
    if (
      user.passwordToken === createHash(token) &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();
    } else {
        res.status(StatusCodes.GONE).json({ msg: 'Token expired/incorrect' })
    }
    res.status(StatusCodes.OK).json({ msg: 'Password reset' })
}

module.exports = {
    register,
    registerAgency,
    login,
    verifyEmail,
    changePassword,
    forgetPassword,
    resetPassword
}