if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}

exports.lightenColor = function(d) {
  if (d._children) return "#83b4d7";
  if (d.children) return "#d1e2f2";
  if (d.result && d.result.startsWith("OK")) return "#aaffaa";
  if (d.result && d.result.startsWith("ERROR")) return "#ff7f7f";
  else return "#fdba8a";
}

exports.color = function(d) {
  if (d._children) return "#3182bd";
  if (d.children) return "#c6dbef";
  if (d.result && d.result.startsWith("OK")) return "#5f5";
  if (d.result && d.result.startsWith("ERROR")) return "#f00";
  else return "#fd8d3c";
}

exports.constraintParser = function(constraint) {
  var result = constraint.substring(1, constraint.length - 1);
  result = result.split("'").join("");
  result = result.split("(double)").join("");
  return result;
}

exports.translationParser = function(trans) {
  var result = trans.substring(10, trans.length - 1);
  result = result.split(",");
  return result;
}

exports.removeChildrenOf = function(id) {
  var node = document.getElementById(id);
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}
