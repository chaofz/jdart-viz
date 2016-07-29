var d3 = require('d3');
var visChart = require('./vis-chart');

var id = 0;
var simpleJson;
var complexJson;

function $id(id) {
  return document.getElementById(id);
}

function outputCodeLine(line, i) {
  line = line.split(" ").join("&nbsp;");
  var code = $id('code');
  var span = document.createElement("span");
  span.className = "code-line";
  span.id = "line-" + i;
  span.innerHTML = line;
  code.appendChild(span);
}

function largeDemo() {
  if (!complexJson) {
    d3.json("data/merarbiter_v0.json", function(json) {
      preprocessJson(json);
      complexJson = json;
      visChart.loadJsonToChart(json);
    });
  } else {
    visChart.loadJsonToChart(complexJson);
  }
}

function smallDemo() {
  if (!simpleJson) {
    d3.json("data/demo2.json", function(json) {
      preprocessJson(json);
      simpleJson = json;
      visChart.loadJsonToChart(json);
    });
  } else {
    visChart.loadJsonToChart(simpleJson);
  }
  json.code.forEach(function(line, i) {
    outputCodeLine(line, i + 1);
  });
}

function init() {
  var target = 'data/';
  if (location.pathname === '/') {
    target += 'demo2.json';
    simpleJson = json;
    json.code.forEach(function(line, i) {
      outputCodeLine(line, i + 1);
    });
  } else {
    target += location.pathname.substring(1);
  }

  d3.json(target, function(json) {
    preprocessJson(json);
    visChart.loadJsonToChart(json);
  });

  $id('expand-errors').onclick = visChart.expandErrors;
  $id('expand-ok').onclick = visChart.expandOK;
  $id('expand-dontknow').onclick = visChart.expandDontKnow;
  $id('small-demo').onclick = smallDemo;
  $id('large-demo').onclick = largeDemo;
}

function preprocessJson(obj) {
  if (obj.result && obj.result.startsWith('ERROR')) {
    var tmp = obj;
    while (tmp) {
      tmp.hasError = true;
      tmp = tmp.parent;
    }
  } else if (obj.result && obj.result.startsWith('OK')) {
    var tmp = obj;
    while (tmp) {
      tmp.hasOK = true;
      tmp = tmp.parent;
    }
  } else if (obj.result && obj.result.startsWith('DONT_KNOW')) {
    var tmp = obj;
    while (tmp) {
      tmp.hasDontKnow = true;
      tmp = tmp.parent;
    }
  }
  obj._id = id++;
  if (obj.children) {
    obj.children.forEach(function(child) {
      child.parent = obj;
      preprocessJson(child);
    });
  }
}

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}

init();
