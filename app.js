
/**
 * Module dependencies.
 */
var express = require('express'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    errorHandler = require('errorhandler'),
    http = require('http'),
    path = require('path'),
    prismic = require('express-prismic').Prismic,
    configuration = require('./prismic-configuration').Configuration;

var app = express();

prismic.init(configuration);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon("public/images/punch.png"));
app.use(logger('dev'));
app.use(bodyParser());
app.use(methodOverride());
app.use(cookieParser('1234'));
app.use(session({secret: '1234', saveUninitialized: true, resave: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(errorHandler());

function handleError(err, req, res) {
  if (err.status == 404) {
    res.status(404).send("404 not found");
  } else {
    res.status(500).send("Error 500: " + err.message);
  }
}

// Routes
app.route('/').get(function(req, res) {
  var p = prismic.withContext(req,res);
  //p.queryFirst(['at', 'my.page.uid', 'get-started'], function (err, document) {
  //import primsic as well???
  //p.queryFirst(Prismic.Predicates.at('my.page.uid', 'get-started'), function (err, document) {
  p.getByUID('page', 'get-started', function (err, prismicdoc) {
    if (err) {
      handleError(err, req, res);
    } else {
      res.render('index-prismic', {
        prismicdoc: prismicdoc
      });
    }
  });
});

app.route('/preview').get(prismic.preview);

var PORT = app.get('port');

app.listen(PORT, function() {
  console.log('Express server listening on port ' + PORT);
});
