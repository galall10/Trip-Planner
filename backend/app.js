require('dotenv').config();
require('express-async-errors');

const express = require('express');
const app = express();

// extra packages
const cors = require('cors');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');

const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));

// database
const connectDB = require('./db/connect');

// routers
const authRouter = require('./routes/auth');
const tripRouter = require('./routes/trip');
const userRouter = require('./routes/user');
const postRouter = require('./routes/post');
const reviewRouter = require('./routes/review');
const commentRouter = require('./routes/comment');

// middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const {authenticateUser:authenticationMiddleware} = require('./middleware/authentication');

app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 1000,
  })
);    
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());

// routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/trip', authenticationMiddleware, tripRouter);
app.use('/api/v1/user', authenticationMiddleware, userRouter);
app.use('/api/v1/post', authenticationMiddleware, postRouter);
app.use('/api/v1/review', authenticationMiddleware, reviewRouter);
app.use('/api/v1/comment', authenticationMiddleware, commentRouter);

// error handler
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
