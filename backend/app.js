var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var matchRouter = require('./routes/match');

// const MONGODB_URI = "mongodb+srv://shoaibshaikh:shoaib101@cluster0-dkwyi.mongodb.net/Gamerzapp";
const MONGODB_URI = "mongodb://localhost/MatchDemo";
var app = express();
app.use(cors());


const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

store.on('error', function (error) {
  console.log(error);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
  secret: "my secret",
  resave: false,
  saveUninitialized: true,
  store: store
})
);



app.use((req, res, next) => {
  // res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); ``
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', usersRouter);
app.use('/api', matchRouter);


app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});


app.use((req, res, next) => {
  // throw new Error("sync Dummy");
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      // throw new Error('Dummy');
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

mongoose
  .connect(
    MONGODB_URI,
    { useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false }
  )
  .then(result => {
    console.log('connected to mongoDB');

    // app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });

module.exports = app;
