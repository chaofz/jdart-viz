var jsonList = {};
var fileId = 0;

// getElementById
function $id(id) {
  return document.getElementById(id);
}

function formatSizeUnits(bytes) {
  if (bytes >= 1073741824) {
    bytes = (bytes / 1073741824).toFixed(2) + ' GiB';
  } else if (bytes >= 1048576) {
    bytes = (bytes / 1048576).toFixed(2) + ' MiB';
  } else if (bytes >= 1024) {
    bytes = (bytes / 1024).toFixed(2) + ' KiB';
  } else if (bytes > 1) {
    bytes = bytes + ' bytes';
  } else if (bytes == 1) {
    bytes = bytes + ' byte';
  } else {
    bytes = '0 byte';
  }
  return bytes;
}

// output information
function output(filename, size) {
  var fileList = $id('file-list');
  var li = document.createElement("li");
  li.className = "file " + fileId;
  li.innerHTML =
    '<strong>' + filename + '</strong>, ' + size +
    '<span class="file-status">' + // '<span class="open-file">load</span>' +
    '<span class="loading"><i class="fa fa-spinner" aria-hidden="true"></i></span>' +
    '</span>';
  fileList.appendChild(li);
  fileId++;
  return li;
}

function getEventTarget(e) {
  e = e || window.event;
  return e.target || e.srcElement;
}

function openFile(e) {
  var target = getEventTarget(e);
  if (target.classList[0] === 'delete') {
    return;
  }
  if (target.classList.length === 0) {
    target = target.parentNode;
  }
  var prevSelected = document.getElementsByClassName('selected')[0];
  if (typeof(prevSelected) === "undefined") {
    target.classList.add("selected");
  } else if (prevSelected.classList[1] !== target.classList[1]) {
    prevSelected.classList.remove("selected");
    target.classList.add("selected");
  }
  loadChart(jsonList[target.classList[1]]);
}

function deleteFile(e) {
  var target = getEventTarget(e);
  target.parentNode.parentNode.remove();
}

// file drag hover
function fileDragHover(e) {
  e.stopPropagation();
  e.preventDefault();
  $id('filedrag').className = (e.type == 'dragover' ? 'hover' : '');
}

// file drag hover
function fileDragLeave(e) {
  e.stopPropagation();
  e.preventDefault();
  $id('filedrag').className = (e.type == 'dragover' ? 'hover' : '');
}

// file selection
function fileSelectHandler(e) {
  // cancel event and hover styling
  fileDragHover(e);
  // fetch FileList object
  var files = e.target.files || e.dataTransfer.files;
  // = files[files.length - 1];
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    if (!file.type.match('json')) {
      continue;
    }
    var newFileLi = listFile(file);
    (function(file, newFileLi) {
      readFile(file, newFileLi, function(json) {
        addClickListeners(newFileLi);
        jsonList[newFileLi.classList[1]] = json;
      });
    })(file, newFileLi);
  }
}

function addClickListeners(newFileLi) {
  var fileStatus = newFileLi.getElementsByClassName("file-status")[0];
  fileStatus.innerHTML =
    '<i class="delete fa fa-trash-o fa-lg" aria-hidden="true"></i>';
  newFileLi.addEventListener("click", openFile, false);
  fileStatus.getElementsByClassName("delete")[0].addEventListener("click", deleteFile, false);
}

// output file information
function listFile(file) {
  return output(file.name, formatSizeUnits(file.size));
}

function readFile(file, index, callback) {
  if (file.type.match('json')) {
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(e) {
      var json = JSON.parse(e.target.result);
      callback(json);
    }
  }
}

function loadDemo() {
  d3.json("data/demo1.json", function(json) {
    var newFileLi = output("demo1.json", formatSizeUnits(1229));
    jsonList[newFileLi.classList[1]] = json;
    addClickListeners(newFileLi);
  });
  d3.json("data/demo2.json", function(json) {
    var newFileLi = output("demo2.json", formatSizeUnits(2145));
    jsonList[newFileLi.classList[1]] = json;
    addClickListeners(newFileLi);
  });
  d3.json("data/demo3.json", function(json) {
    var newFileLi = output("demo3.json", formatSizeUnits(14538240));
    jsonList[newFileLi.classList[1]] = json;
    addClickListeners(newFileLi);
  });
}

// initialize
function init() {
  // var fileselect = $id('fileselect');
  var filedrag = $id('filedrag');
  loadDemo();

  // file drop
  filedrag.addEventListener('dragover', fileDragHover, false);
  filedrag.addEventListener('dragleave', fileDragLeave, false);
  filedrag.addEventListener('drop', fileSelectHandler, false);

  // file select
  // fileselect.addEventListener('change', fileSelectHandler, false);
  // var submitbutton = $id('submitbutton');
  // remove submit button
  // submitbutton.style.display = 'none';
  // }
}

// call initialization file
if (window.File && window.FileList && window.FileReader) {
  init();
}
