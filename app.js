var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
var logger = require('morgan');
var session = require('express-session');
const config = require('./config.json');
var { models } = require('./models/db')

var detectorRouter = require('./routes/detector');
var signupRouter = require('./routes/signup');
var loginRouter = require('./routes/login');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(fileUpload({
  useTempFiles : true,
  tempFileDir : config.imageUploadPath,
  limits: { fileSize: 50 * 1024 * 1024 }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser(config.session_secret_key));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  key: 'user_sid',
  secret: config.session_secret_key,
  resave: false,
  saveUninitialized: false,
  cookie: {
      expires: 600000
  }
}));
// middleware function to check for logged-in users
var regularUserSessionChecker = (req, res, next) => {
  if (req.session.user) {
      next();
  } else {
    res.redirect('/login');
  }    
};
var adminUserSessionChecker = (req, res, next) => {
  if (req.session.user && req.session.user.username == config.adminUser.username) {
      next();
  } else {
    res.redirect('/login');
  }    
};

app.use('/signup', signupRouter);
app.use('/login', loginRouter);
app.use('/detect', regularUserSessionChecker, detectorRouter);
app.use('/users', adminUserSessionChecker, usersRouter);
app.get('/logout', (req, res) => {
  if (req.session.user) {
    req.session.destroy();
  }
  res.redirect('/login');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('500');
});

module.exports = app;
