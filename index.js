var express = require('express'),
  app = express(),
  loki = require('lokijs'),
  bodyParser = require('body-parser'),
  defaultOptions = {
    port: 20800
  },
  config = require(__dirname + '/' + (process.argv[3] || 'config.js')) || defaultOptions,
  db = new loki(config.file || 'loki.json'),
  routes = require('./routes')(db);

function tryDbLoad(db) {
  try {
    db.loadDatabase();
  } catch (err) {
    console.log('No existing file to load from.')
  }
}

tryDbLoad(db);


function setRoute(route) {
  console.log('registering ' + route.url + '[' + route.method + ']');
  app[route.method](route.url, route.handler);
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
routes.forEach(setRoute);

app.listen(config.port, function () {
  console.log('Listening to ' + config.port);
});