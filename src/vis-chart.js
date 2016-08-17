var d3 = require('d3');
var utils = require('./utils/utils');

var chartAreaWidth = parseInt(d3.select('#chart').style('width'));
var chartAreaHeight = parseInt(d3.select('#chart').style('height'));

var root;
var json;
var i = 0;
var barHeight = 30;
var barWidth = chartAreaWidth - 150;
var duration = 400;
var tree = d3.layout.tree().size([chartAreaHeight, 100]);

var highlight = true;
var lastZoomEvent;
var branchLocked = false;

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
  .attr("id", "main")
  .append("g")
  .attr("transform", "translate(20,35)scale(1)");

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
    .style("fill", utils.color)
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
        return utils.constraintParser(d.decision);
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
    .style("fill", utils.color);

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

// Toggle children on click.
function click(d) {
  if (branchLocked) {
    return;
  }
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}

function hover(d) {
  if (branchLocked) {
    return;
  }
  if (highlight) {
    d3.selectAll('rect').style("fill", utils.lightenColor);
  }
  var parent = d;
  while (parent) {
    if (highlight) {
      d3.select('#_' + parent._id).style("fill", 'blue');
    }
    parent = parent.parent;
  }
}

function mouseout(d) {
  if (!branchLocked) {
    d3.selectAll(".code-line").classed("highlight", false);
    d3.selectAll('rect').style("fill", utils.color);
  }
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

function listStatuses(obj, filter) {
  if (obj[filter]) {
    var branches = document.getElementById('branches');
    var span = document.createElement("span");
    span.className = "branch";
    span.id = obj._id;
    span.innerHTML = '<i class="fa fa-caret-right"></i>&nbsp&nbsp' + obj.result;
    span.onmouseover = branchHover;
    span.onmouseout = mouseout;
    span.onclick = branchClick;
    branches.appendChild(span);
  }
  if (obj.children) {
    obj.children.forEach(function(child) {
      listStatuses(child, filter);
    });
  }
}

function branchClick(e) {
  var d = d3.select('#_' + e.target.id).data()[0];
  var action = e.target.firstChild.className === 'fa fa-caret-right' ? 'open' : 'close';
  e.target.firstChild.className = action === 'open' ? 'fa fa-caret-down' : 'fa fa-caret-right';
  if (action === 'open') {
    while (d) {
      var branches = document.getElementById('branches');
      var span = document.createElement("span");
      span.className = "sub sub-" + e.target.id;
      span.id = d._id;
      span.innerHTML = d.result || utils.constraintParser(d.decision);
      span.onmouseover = branchHover;
      span.onclick = branchLock;
      span.onmouseout = mouseout;
      branches.insertBefore(span, e.target.nextSibling);
      d = d.parent;
    }
  } else {
    if (document.getElementsByClassName('sub-' + e.target.id + ' locked').length > 0) {
      branchLocked = false;
    }
    d3.selectAll(".sub-" + e.target.id).remove();
  }
  centerBranch(e.target);
}

function centerBranch(target) {
  d3.select('.centered').classed('centered', false);
  d3.select('#_' + target.id).classed('centered', true);

  var trans = document.getElementById('_' + target.id).parentNode.getAttribute('transform');

  var rectCoor = utils.translationParser(trans);
  var rectX = parseInt(rectCoor[0]);
  var rectY = parseInt(rectCoor[1]);

  var svg = document.getElementById("chartSvg");
  var rect = document.getElementsByTagName("rect")[0];

  var svgW = parseInt(svg.getAttribute('width'));
  var svgH = parseInt(svg.getAttribute('height'));

  var rectW = parseInt(rect.getAttribute('width'));
  var rectH = parseInt(rect.getAttribute('height'));

  var zoomTrans = vis.attr("transform");
  var zoomTranslate = zoomTrans.substring(0, zoomTrans.indexOf('scale'));
  var scale = zoomTrans.substring(zoomTrans.indexOf("scale") + 6, zoomTrans.length - 1);

  var transl = utils.translationParser(zoomTranslate);
  var translate = [
    (svgW / 2 - rectW / 2 - parseInt(transl[0]) - rectX) * scale + 25,
    (svgH / 2 - rectH / 2 - parseInt(transl[1]) - rectY) * scale + 35
  ];

  d3.select('#main')
    .transition()
    .duration(duration)
    .attr("transform", "translate(" + translate + ")");
}

function branchLock(e) {
  if (branchLocked && e.target.classList.contains('locked')) {
    branchLocked = false;
    e.target.removeChild(e.target.firstChild);
    e.target.classList.remove('locked');
  } else if (!branchLocked) {
    branchLocked = true;
    e.target.innerHTML = '<i class="fa fa-lock"></i>' + e.target.innerHTML;
    e.target.classList.add('locked');
  }
  centerBranch(e.target);
}

function branchHover(e) {
  if (!branchLocked) {
    var hovered = document.getElementsByClassName('hovered');
    if (hovered.length > 0) {
      hovered[0].classList.remove('hovered');
    }
    e.target.classList.add('hovered');
    var d = d3.select('#_' + e.target.id).data()[0];
    hover(d);
  }
}

function appendBranchesTitle(title) {
  document.getElementById('branches-title').innerHTML = title + ' Branches';
}

exports.expandErrors = function() {
  appendBranchesTitle('ERROR');
  expandStatus(json, 'hasError');
  expandGeneral(json);
  listStatuses(json, 'isError');
}

exports.expandOK = function() {
  appendBranchesTitle('OK');
  expandStatus(json, 'hasOK');
  expandGeneral(json);
  listStatuses(json, 'isOK');
}

exports.expandDontKnow = function() {
  appendBranchesTitle('DONT_KNOW');
  expandStatus(json, 'hasDontKnow');
  expandGeneral(json);
  listStatuses(json, 'isDontKnow');
}

function expandGeneral(json) {
  branchLocked = false;
  utils.removeChildrenOf('branches');
  update(json);
}

function expandStatus(d, filter) {
  var children = d._children || d.children;
  if (d[filter]) {
    d.children = children;
    d._children = null;
  } else if (!d[filter] && d.children) {
    d._children = d.children;
    d.children = null;
  }
  if (children) {
    expandStatus(children[0], filter);
    expandStatus(children[1], filter);
  }
}

exports.loadJsonToChart = function(_json) {
  branchLocked = false;
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
