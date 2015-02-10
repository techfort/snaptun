(function (root, $) {

  var state = {
    collections: [],
    currentCollection: null,
    data: []
  };

  function streamMaker() {
    var registeredListeners = [];
    return {
      observe: function (callback) {
        registeredListeners.push(callback)
      },
      update: function (value) {
        registeredListeners.forEach(function (cb) {
          cb(value);
        })
      }
    };
  }

  var history = streamMaker();
  history.observe(pplCollList);

  function pplCollList(state) {
    var list = $('#collections');
    list.empty();
    state.collections.forEach(function (o) {
      list.append($('<li></li>').text(o.name + '[' + o.count + ']'));
    });
  }

  function copy(obj) {
    if (Array.isArray(obj)) {
      return JSON.parse(JSON.stringify(obj));
    }

    var ret = {};
    Object.keys(obj).forEach(function (prop) {
      ret[prop] = copy(obj[prop]);
    });
    return ret;
  }

  function pushToStream(state) {
    return function (data) {
      console.log('Data received, pushing to stream...');
      var newstate = copy(state);
      newstate.collections = data;
      history.update(newstate);
      return newstate;
    };
  }

  var setColls = pushToStream(history);

  function getStats() {
    $.getJSON('/listcollections', setColls);
  }

  function createColl(name, options, callback) {
    $.post('/addcollection', {
      name: name,
      options: options
    }, callback);
  }

  getStats();

  function initUI() {
    $('#newcoll').blur(function () {
      createColl($('#newcoll').val(), {}, getStats);
    })
  }

  initUI();

})(window, $);