var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dataRouter = require('./routes/data');
let geoRouter = require('./routes/geo');
let ncovRouter = require('./routes/ncov');

let getData = require('./utils/getData');
let getNcovJson = require('./utils/getNcovJson');
const targetUrl = "https://ncov.dxy.cn/ncovh5/view/pneumonia";

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/data', dataRouter);
app.use('/geo', geoRouter);
app.use('/ncov', ncovRouter);

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

// setInterval(()=>{
getData(targetUrl)
  .then(res => {
    for (let key in res) {
      fs.writeFile(`data/${key}.json`, JSON.stringify(res[key]), (err) => { if (err) console.log(err) });
    }
    fs.writeFile(`data/data.json`, JSON.stringify(res), (err) => {
      console.log('data refreshed!');
      if (err) {
        console.log(err);
      } else {
        getNcovJson()
        .then(()=>{
          console.log('ncov refreshed!');
        });
      }
    });

  });
// },500);



module.exports = app;
