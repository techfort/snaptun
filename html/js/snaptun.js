(function (root, $) {

  var state = {
    collections: [],
    currentCollection: null,
    data: []
  };

  function pplCollList(data) {
    var list = $('#collections');
    list.empty();
    data.forEach(function (o) {
      list.append($('<li></li>').text(o.name + '[' + o.count + ']'));
    });
  }

  function setCollectionsForState(state) {
    return function (data) {
      state.collections = data;
      console.log(state.collections);
      pplCollList(state.collections);
    };
  }

  var setColls = setCollectionsForState(state);

  function getStats() {
    $.getJSON('/listcollections', setColls);
  }

  getStats();

  test();
})(window, $);