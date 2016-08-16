var d3 = require('d3');
var svgScrollerLib = require('./util/svgScroller');

var chartAreaWidth = parseInt(d3.select('#chart').style('width'));
var chartAreaHeight = parseInt(d3.select('#chart').style('height'));

var root;
var json;
var i = 0;
// var errExpanded = false;
var barHeight = 30;
var barWidth = chartAreaWidth - 150;
var duration = 400;
var tree = d3.layout.tree()
  .size([chartAreaHeight, 100]);

var highlightCheck = document.getElementById("highlight-check");
var highlightCheckSpan = document.getElementById("checkbox");
var highlight = highlightCheck.checked;

highlightCheck.onchange = function() {
  highlight = highlightCheck.checked;
}

highlightCheckSpan.onclick = function(e) {
  if (e.target === highlightCheck) return;
  highlight = highlightCheck.checked = !highlightCheck.checked;
}

var diagonal = d3.svg.diagonal()
  .projection(function(d) {
    return [d.y, d.x];
  });

var zoom = d3.behavior.zoom()
  .scaleExtent([0.1, 1])
  .on("zoom", zoomed);

var vis = d3.select("#chart").append("svg")
  .attr("id", "chartSvg")
  .attr("width", chartAreaWidth)
  .attr("height", chartAreaHeight)
  .call(zoom)
  .append("g")
  .attr("transform", "translate(20,35)");

var chartSvg = d3.select("#chartSvg");

function zoomed() {
  d3.event.translate[0] += 20;
  d3.event.translate[1] += 35;
  vis.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function moveChildren(node) {
  if (node.children) {
    node.children.forEach(function(c) {
      moveChildren(c);
    });
    node._children = node.children;
    node.children = null;
  }
}

function update(source) {
  var nodes = tree.nodes(root);
  var currentHeight = 0;

  nodes.forEach(function(n, i) {
    n.x = i * barHeight;
  });

  var node = vis.selectAll("g.node")
    .data(nodes, function(d) {
      return d.id || (d.id = ++i);
    });

  var nodeEnter = node.enter().append("g")
    .attr("class", "node")
    .attr("transform", function(d) {
      return "translate(" + source.y0 + "," + source.x0 + ")";
    })
    .style("opacity", 1e-6);

  // Enter any new nodes at the parent's previous position.
  nodeEnter.append("rect")
    .attr("y", -barHeight / 2)
    .attr("height", barHeight)
    .attr("width", barWidth)
    .style("fill", color)
    .attr("id", function(d) {
      return '_' + d._id;
    })
    .on("click", click)
    .on('mouseover', hover)
    .on('mouseout', mouseout);

  nodeEnter.append("text")
    .attr("dy", 5)
    .attr("dx", 10)
    .text(function(d) {
      if (d.decision !== "null")
        return constraintParser(d.decision);
      return d.result;
    });

  // Transition nodes to their new position.
  nodeEnter.transition()
    .duration(duration)
    .attr("transform", function(d) {
      return "translate(" + d.y + "," + d.x + ")";
    })
    .style("opacity", 1);

  node.transition()
    .duration(duration)
    .attr("transform", function(d) {
      return "translate(" + d.y + "," + d.x + ")";
    })
    .style("opacity", 1)
    .select("rect")
    .style("fill", color);

  // Transition exiting nodes to the parent's new position.
  node.exit().transition()
    .duration(duration)
    .attr("transform", function(d) {
      return "translate(" + source.y + "," + source.x + ")";
    })
    .style("opacity", 1e-6)
    .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// function collapseDesds(d) {
//   if (d.children) {
//     d._children = d.children;
//     d.children = null;
//   } else {
//     d.children = d._children;
//     d._children = null;
//   }
//   // console.log(d);
//   update(d);
//   var children = d.children || d._children;
//   if (children != null) {
//     children.forEach(function(child) {
//       collapseDesds(child);
//     });
//   }
// }

// Toggle children on click.
function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}

function highlightCode(d) {
  var lineNumber = d && (d.lineNumber || d.parent && d.parent.lineNumber);
  if (lineNumber) {
    d3.select("#line-" + lineNumber).classed("highlight", true);
  }
}

function hover(d) {
  if (highlight) {
    d3.selectAll('rect').style("fill", lightenColor);
  }
  var parent = d;
  while (parent) {
    highlightCode(parent);
    if (highlight) {
      d3.select('#_' + parent._id).style("fill", 'blue');
    }
    parent = parent.parent;
  }
}

function mouseout(d) {
  d3.selectAll(".code-line").classed("highlight", false);
  d3.selectAll('rect').style("fill", color);
}

function updateAll(node) {
  if (!node.children) {
    return;
  }
  node.children.forEach(function(c) {
    update(c);
    updateAll(c);
  });
}

exports.expandErrors = function() {
  expandErr(json, 'error');
  update(json);
}

exports.expandOK = function() {
  expandErr(json, 'ok');
  update(json);
}

exports.expandDontKnow = function() {
  expandErr(json, 'dontknow');
  update(json);
}

function expandErr(d, filter) {
  var children = d._children || d.children;
  var has;
  if (filter === 'error') {
    has = d.hasError;
  } else if (filter === 'ok') {
    has = d.hasOK;
  } else {
    has = d.hasDontKnow;
  }
  if (has) {
    d.children = children;
    d._children = null;
  } else if (!has && d.children) {
    d._children = d.children;
    d.children = null;
  }
  if (children) {
    expandErr(children[0], filter);
    expandErr(children[1], filter);
  }
}

function lightenColor(d) {
  if (d._children) return "#83b4d7";
  if (d.children) return "#d1e2f2";
  if (d.result && d.result.startsWith("OK")) return "#aaffaa";
  if (d.result && d.result.startsWith("ERROR")) return "#ff7f7f";
  else return "#fdba8a";
}

function color(d) {
  if (d._children) return "#3182bd";
  if (d.children) return "#c6dbef";
  if (d.result && d.result.startsWith("OK")) return "#5f5";
  if (d.result && d.result.startsWith("ERROR")) return "#f00";
  else return "#fd8d3c";
}

function constraintParser(constraint) {
  var result = constraint.substring(1, constraint.length - 1);
  result = result.split("'").join("");
  result = result.split("(double)").join("");
  return result;
}

exports.loadJsonToChart = function(_json) {
  json = _json;
  json.x0 = 0;
  json.y0 = 0;
  moveChildren(json);
  update(root = json);
};

exports.resize = function() {
  chartAreaWidth = parseInt(d3.select('#chart').style('width'));
  chartAreaHeight = parseInt(d3.select('#chart').style('height'));
  barWidth = chartAreaWidth - 150;
  chartSvg.attr('width', chartAreaWidth);
  chartSvg.attr('height', chartAreaHeight);
  d3.selectAll('rect').attr('width', barWidth);
  d3.selectAll('.node').attr('width', barWidth);
};

exports.clear = function() {
  chartSvg.select('g').selectAll("*").remove();
}
