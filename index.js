var express = require('express'),
  app = express(),
  loki = require('lokijs'),
  bodyParser = require('body-parser'),
  defaultOptions = {
    port: 20800
  },
  config = require(__dirname + '/' + (process.argv[3] || 'config.js')) || defaultOptions,
  db = new loki(config.file || 'loki.json'),
  routes = [{
    method: 'post',
    url: '/addcollection',
    handler: function (req, res) {
      if (!req.body.name) {
        res.status(400).send({
          message: 'missing collection name parameter'
        });
        return;
      }
      var options = {
        indices: req.body.options.indices || [],
        transactional: req.body.options.transactional || false,
        asyncListeners: req.body.options.asyncListeners || false,
        clone: req.body.options.clone || false,
        disableChangesApi: req.body.options.disableChangesApi || false
      };
      var coll = db.addCollection(req.body.name, options);
      res.status(coll ? 200 : 500).send({
        message: 'Collection ' + req.body.name + ' created successfully',
        config: {
          't': coll.transactional,
          'a': coll.asyncListeners,
          'c': coll.cloneObjects
        }
      });
      return;
    }
  }, {
    method: 'post',
    url: '/insert',
    handler: function (req, res) {
      if (!req.body.doc || !req.body.collection) {
        res.status(400).send({
          'message': 'missing document or collection parameter'
        });
        return;
      }
      var doc = db.getCollection(req.body.collection).insert(req.body.doc);
      db.saveDatabase();
      res.send({
        'message': 'Document inserted',
        'doc': doc
      });
      return;
    }
  }];

function setRoute(route) {
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