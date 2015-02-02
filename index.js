var express = require('express'),
  app = express(),
  loki = require('lokijs'),
  bodyParser = require('body-parser'),
  defaultOptions = {
    port: 20800
  },
  config = require(__dirname + '/' + (process.argv[3] || 'config.js')) || defaultOptions,
  file = config.file || 'loki.json',
  db = new loki(file, {
    autoload: true
  }),
  fs = require('fs'),
  routes = require('./routes')(db);

function tryDbLoad(db) {
  if (fs.existsSync(file)) {
    try {
      db.loadDatabase();
    } catch (err) {
      console.log('No existing file to load from.')
    }
  }
}

var instance, server = {
  start: function () {
    instance = app.listen(config.port, function () {
      console.log('Listening to ' + config.port);
    });
  },
  stop: function () {
    instance.close();
    console.log('Server stopped');
  }
};


//tryDbLoad(db);


function setRoute(route) {
  app.all(route.url, function (req, res, next) {
    res.set('Content-Type', 'application/json');
    next();
  });
  console.log('registering ' + route.url + '[' + route.method + ']');
  app[route.method](route.url, route.handler);
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

routes.forEach(setRoute);
app.get('/stop', function (req, res) {
  res.send('Snaptun LokiJS server stopped');
  server.stop();
  process.exit(0);
});



module.exports = server;