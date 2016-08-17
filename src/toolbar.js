var d3 = require('d3');
var visChart = require('./vis-chart');
var utils = require('./utils/utils');

var id = 0;
var simpleJson;
var complexJson;
var currJson;

function largeDemo() {
  utils.removeChildrenOf('branches');
  if (!complexJson) {
    d3.json("data/test_m1.jpf", function(json) {
      preprocessJson(json);
      complexJson = json;
      visChart.loadJsonToChart(json);
    });
  } else {
    visChart.loadJsonToChart(complexJson);
  }
}

function smallDemo() {
  utils.removeChildrenOf('branches');
  if (!simpleJson) {
    d3.json("data/demo2.json", function(json) {
      preprocessJson(json);
      simpleJson = json;
      visChart.loadJsonToChart(json);
    });
  } else {
    visChart.loadJsonToChart(simpleJson);
  }
}

function preprocessJson(obj) {
  if (obj.result && obj.result.startsWith('ERROR')) {
    obj.isError = true;
    addStatusToAncestors(obj, 'hasError');
  } else if (obj.result && obj.result.startsWith('OK')) {
    obj.isOK = true;
    addStatusToAncestors(obj, 'hasOK');
  } else if (obj.result && obj.result.startsWith('DONT_KNOW')) {
    obj.isDontKnow = true;
    addStatusToAncestors(obj, 'hasDontKnow');
  }
  obj._id = id++;
  if (obj.children) {
    obj.children.forEach(function(child) {
      child.parent = obj;
      preprocessJson(child);
    });
  }
  currJson = obj;
}

function init() {
  var target = 'data/' + location.pathname.substring(1);
  if (target === 'data/') {
    target = 'data/demo2.json';
  }
  d3.json(target, function(json) {
    preprocessJson(json);
    visChart.loadJsonToChart(json);
    // document.getElementById('expand-errors').click();
  });

  document.getElementById('expand-errors').onclick = visChart.expandErrors;
  document.getElementById('expand-ok').onclick = visChart.expandOK;
  document.getElementById('expand-dontknow').onclick = visChart.expandDontKnow;
  document.getElementById('small-demo').onclick = smallDemo;
  document.getElementById('large-demo').onclick = largeDemo;
}

function addStatusToAncestors(curr, status) {
  while (curr) {
    curr[status] = true;
    curr = curr.parent;
  }
}

init();
