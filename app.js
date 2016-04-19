
/**
 * Module dependencies.
 */
var express = require('express'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    errorHandler = require('errorhandler'),
    http = require('http'),
    path = require('path'),
    Prismic = require('express-prismic').Prismic,
    configuration = require('./prismic-configuration').Configuration;

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(favicon("public/images/punch.png"));
app.use(logger('dev'));
app.use(bodyParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(errorHandler());

function handleError(err, req, res) {
  if (err.status == 404) {
    res.status(404).send("404 not found");
  } else {
    res.status(500).send("Error 500: " + err.message);
  }
}

function api(req, res) {
  // So we can use this information in the views
  res.locals.ctx = {
    endpoint: configuration.apiEndpoint,
    linkResolver: configuration.linkResolver
  };
  return Prismic.api(configuration.apiEndpoint, configuration.accessToken, req);
}

// Routes
app.route('/').get(function(req, res) {
  api(req, res).then(function(api) {
    return api.getByUID('page', 'get-started');
  }).then(function(prismicdoc) {
    res.render('index-prismic', {
      prismicdoc: prismicdoc
    });
  }).catch(function(err) {
    handleError(err, req, res);
  });
});

app.route('/preview').get(Prismic.preview);

var PORT = app.get('port');

app.listen(PORT, function() {
  console.log('Express server listening on port ' + PORT);
});
