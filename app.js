var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var cors = require('cors');

var auth = require('./middleware/auth')

// .env
require('dotenv').config()

var indexRouter = require('./routes/v1/index');
var usersRouter = require('./routes/v1/users');
var todosRouter = require('./routes/v1/todos');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1', indexRouter);
app.use('/users', usersRouter);
app.use('/todos', auth.isAuthenticated, todosRouter);

// db env
const env = process.env.NODE_ENV || "development";

if (env == 'development' || env == 'test') {
  require('dotenv').config()
}

const configDB = {
  development: process.env.DB_DEV,
  test: process.env.DB_TEST || $DB_TEST,
  production: process.env.DB_PROD
}

const dbConnection = configDB[env];

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
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

// database connection
mongoose.set('useCreateIndex', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useNewUrlParser', true)
mongoose.connect(dbConnection)
  .then(() => console.log('Database connection successful'))

module.exports = app;