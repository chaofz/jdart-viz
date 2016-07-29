var d3 = require('d3');
var visChart = require('./vis-chart');

var jsonList = {};
var fileId = 0;

function $id(id) {
  return document.getElementById(id);
}

// function formatSizeUnits(bytes) {
//   if (bytes >= 1073741824) {
//     bytes = (bytes / 1073741824).toFixed(2) + ' GiB';
//   } else if (bytes >= 1048576) {
//     bytes = (bytes / 1048576).toFixed(2) + ' MiB';
//   } else if (bytes >= 1024) {
//     bytes = (bytes / 1024).toFixed(2) + ' KiB';
//   } else if (bytes > 1) {
//     bytes = bytes + ' bytes';
//   } else if (bytes == 1) {
//     bytes = bytes + ' byte';
//   } else {
//     bytes = '0 byte';
//   }
//   return bytes;
// }

// function output(filename, size) {
//   var fileList = $id('file-list');
//   var li = document.createElement("li");
//   li.className = "file"
//   li.id = fileId;
//   li.innerHTML =
//     '<span>' + filename + '</span>' +
//     '<span class="file-status">' + // '<span class="open-file">load</span>' +
//     '<span class="loading"><i class="fa fa-spinner"></i></span>' +
//     '</span>';
//   fileList.appendChild(li);
//   fileId++;
//   return li;
// }

// function getEventTarget(e) {
//   e = e || window.event;
//   return e.target || e.srcElement;
// }

// function openFile(e) {
//   var target = getEventTarget(e);
//   if (target.classList[0] === 'delete' || target.classList[0] === 'file-status') {
//     return;
//   }
//   if (target.classList.length === 0) {
//     target = target.parentNode;
//   }
//   var prevSelected = document.getElementsByClassName('selected')[0];
//   if (typeof(prevSelected) === "undefined") {
//     target.classList.add("selected");
//   } else if (prevSelected.id !== target.id) {
//     prevSelected.classList.remove("selected");
//     target.classList.add("selected");
//   }
//   visChart.loadJsonToChart(jsonList[target.id]);
// }

// function deleteFile(e) {
//   var target = getEventTarget(e);
//   var liToRemove = target.parentNode.parentNode;
//   liToRemove.innerHTML = '';
//   liToRemove.classList.add("removing");
//   visChart.clear();

//   (function(liToRemove) {
//     setTimeout(function() {
//       liToRemove.remove();
//     }, 200);
//   })(liToRemove);
// }

// // file drag hover
// function fileDragHover(e) {
//   e.stopPropagation();
//   e.preventDefault();
//   $id('filedrag').className = (e.type == 'dragover' ? 'hover' : '');
// }

// // file drag hover
// function fileDragLeave(e) {
//   e.stopPropagation();
//   e.preventDefault();
//   $id('filedrag').className = (e.type == 'dragover' ? 'hover' : '');
// }

// // file selection
// function fileSelectHandler(e) {
//   // cancel event and hover styling
//   fileDragHover(e);
//   // fetch FileList object
//   var files = e.target.files || e.dataTransfer.files;
//   // = files[files.length - 1];
//   for (var i = 0; i < files.length; i++) {
//     var file = files[i];
//     if (!file.type.match('json')) {
//       continue;
//     }

//     var newFileLi = listFile(file);
//     // (function(file, newFileLi) {
//     readFile(file, newFileLi, function(newFileLi, json) {
//       addClickListeners(newFileLi);
//       jsonList[newFileLi.id] = json;
//     });
//     // })(file, newFileLi);
//   }
// }

// function addClickListeners(newFileLi) {
//   var fileStatus = newFileLi.getElementsByClassName("file-status")[0];
//   fileStatus.innerHTML =
//     '<i class="delete fa fa-trash-o fa-lg" aria-hidden="true"></i>';
//   newFileLi.addEventListener("click", openFile, false);
//   fileStatus.getElementsByClassName("delete")[0].addEventListener("click", deleteFile, false);
// }

// function listFile(file) {
//   return output(file.name, formatSizeUnits(file.size));
// }

// function readFile(file, newFileLi, callback) {
//   if (file.type.match('json')) {
//     var reader = new FileReader();
//     reader.readAsText(file);
//     reader.onload = function(e) {
//       var json = JSON.parse(e.target.result);
//       callback(newFileLi, json);
//     }
//   }
// }

// function loadDemo() {
//   // var newFileLi = output("demo1.json", formatSizeUnits(1229));
//   // loadLocalFile("data/demo1.json", newFileLi);

//   newFileLi = output("demo2.json", formatSizeUnits(2145));
//   loadLocalFile("data/demo2.json", newFileLi);

//   // newFileLi = output("demo3.json", formatSizeUnits(14538240));
//   // loadLocalFile("data/demo3.json", newFileLi);

//   // newFileLi = output("merarbiter_v0.json", '803.62 KiB');
//   // loadLocalFile("data/merarbiter_v0.json", newFileLi);
// }

// function loadLocalFile(filename, newFileLi) {
//   d3.json(filename, function(json) {
//     jsonList[newFileLi.id] = json;
//     visChart.loadJsonToChart(json);
//     addClickListeners(newFileLi);
//   });
// }

function outputCodeLine(line, i) {
  line = line.split(" ").join("&nbsp;");
  var code = $id('code');
  var span = document.createElement("span");
  span.className = "code-line";
  span.id = "line-" + i;
  span.innerHTML = line;
  code.appendChild(span);
}

function init() {
  d3.json("data/demo2.json", function(json) {
    visChart.loadJsonToChart(json);
    json.code.forEach(function(line, i) {
      outputCodeLine(line, i + 1);
    });
  });
  // loadDemo();
  // var fileselect = $id('fileselect');
  // var filedrag = $id('filedrag');
  // filedrag.addEventListener('dragover', fileDragHover, false);
  // filedrag.addEventListener('dragleave', fileDragLeave, false);
  // filedrag.addEventListener('drop', fileSelectHandler, false);

  // file select
  // fileselect.addEventListener('change', fileSelectHandler, false);
  // var submitbutton = $id('submitbutton');
  // remove submit button
  // submitbutton.style.display = 'none';
  // }
}

if (window.File && window.FileList && window.FileReader) {
  init();
}
