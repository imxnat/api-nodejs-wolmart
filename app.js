const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv = require("dotenv");
const connectDatabase = require("./config/database");



//step3 Load config env
dotenv.config({ path: "./config/.env" });

//Connect Database
connectDatabase();

//step2
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users.router');
const productsRouter = require('./routes/products.router');
const ordersRouter = require('./routes/orders.router');
const authRouter = require('./routes/auth.router');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//step1
app.use('/', indexRouter);
// app.use('/auth', authRouter);
app.use('/api/users', usersRouter);
// app.use('/api/products', productsRouter);
// app.use('/api/orders', ordersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404, 'The endpoint does not exist'));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ //step 4
    errorcode: err.status || 500,
    message: res.locals.message
  });
});

module.exports = app;
