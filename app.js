const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const mongoose = require('mongoose');
const session = require('express-session')

mongoose.connect('mongodb://localhost/subway-system', { useNewUrlParser: true })
.then(() => {
  console.log('DB connection successful');
})
.catch((error) => {
  throw error;
});

const indexRouter = require('./routes/index');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'keyboard cat',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24  // 1 day 
  },

  resave: true,
  saveUninitialized: true,
  // 
})); 

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler

module.exports = app;
