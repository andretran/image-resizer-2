var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var multer = require('multer');
var AdmZip = require('adm-zip');
var upload = multer({ dest: 'tmp/' });
var fs = require('fs');
var {processImage} = require('./utils/image');

var app = express();

var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// Uploads a single file via html form and returns image
app.post('/upload', upload.single('uploaded_file'), async function(req, res, next) {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const {height, width} = req.body;
  const imageBuffer = await processImage(height, width, req.file.path);

  res.contentType('image/jpeg');
  res.send(imageBuffer);
});

// Uploads 
app.post('/upload-multiple', upload.array('uploaded_file'), async function(req, res, next) {
  if (!req.files) {
    return res.status(400).send('No file uploaded.');
  }
  const {height, width} = req.body;
  const files = req.files.map((file) => processImage(height, width, file.path));
  const zip = new AdmZip();

  const imageBuffers = await Promise.all(files);
  imageBuffers.forEach((buffer, i) => zip.addFile(`${i}.jpg`, buffer));

  // Delete file uploads after creating zip file buffer.
  req.files.forEach((file) => fs.unlink(file.path, () => {}));

  res.set('Content-Type', 'application/zip');
  res.send(zip.toBuffer());
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
  res.render('error');
});

module.exports = app;
