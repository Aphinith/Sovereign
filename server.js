var express = require('express');
var path = require('path');
var httpProxy = require('http-proxy');
var publicPath = path.resolve(__dirname, 'public');
var fs = require('fs');
var bodyParser = require('body-parser');
var multiparty = require('connect-multiparty'),
  mulitpartyMiddleware = multiparty();
var secret = require('./private.js');

// We need to add a configuration to our proxy server,
// as we are now proxying outside localhost
var isProduction = process.env.NODE_ENV === 'production';
var port = isProduction ? process.env.PORT : 3000;

var proxy = httpProxy.createProxyServer({
  changeOrigin: true
});
var app = express();

app.use(bodyParser.json());
app.use(bodyParser({limit: '50mb'}));
app.use(express.static(publicPath));


/* ROUTES */

var users = require('./server/routes/users');
var movies = require('./server/routes/movies')
app.use('/users', users); /* POST user to db. */
// app.use('/users', users); /* GET users listing. */
// app.use('/*', function(req, res){
//   res.redirect('/#/home');
// })

/*
================================================================================================
POST TO S3 BELOW
================================================================================================
*/

//Below code is for uploading file to S3 bucket in AWS using streaming-s3
//'/video.mp4' should be replaced with variable that siginifies the mp4 being uploaded

var S3FS = require('s3fs');
var s3fsImplementation = new S3FS('galactic.video',{
  accessKeyId: secret.accessKey, 
  secretAccessKey: secret.secretAccessKey,
  endpoint : secret.endpointLocation
});

// s3fsImplementation.create();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(mulitpartyMiddleware);

app.post('/users/video', function(req, res){
  var file = req.files.file;
  console.log('this is file which is file:', file);
  var stream = fs.createReadStream(file.path);
  return s3fsImplementation.writeFile(file.originalFilename, stream)
  .then(function(err){
    fs.unlink(file.path, function(err){
      if(err){
        console.error("This is the error", err);
      }
      console.log('file upload success');
    // console.log('this is res:', res);
    })
    res.send('File Upload Complete');
  });

});

/*
================================================================================================
EXPRESS SERVER WITH WEBPACK BELOW
================================================================================================
*/
// If you only want this for development, you would of course
// put it in the "if" block below

if (!isProduction) {
  var bundle = require('./server/compiler.js')
  bundle()
  app.all('/build/*', function (req, res) {
    proxy.web(req, res, {
        target: 'http://localhost:8080'
    })
  })
};

proxy.on('error', function(e) {
  console.log('Could not connect to proxy, please try again...')
});


app.listen(port, function () {
  console.log('Server running on port ' + port)
});

