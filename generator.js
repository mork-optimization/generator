function log(message){
  var textarea = document.getElementById('logs');
  textarea.value += message;
  textarea.value += '\n';
  textarea.scrollTop = textarea.scrollHeight;
}

// Copy pasted from https://stackoverflow.com/questions/12460378/how-to-get-json-from-url-in-javascript
var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};

function setTags(){
  var selector = document.getElementById('morktag')
  getJSON('https://api.github.com/repos/rmartinsanta/mork/tags', function(status, data){
    console.log("Github tags API response:")
    console.log(data);
    const filtered_data = [];
    for(var i = 0; i < data.length; i++){
      const name = data[i].name;
      if(name.indexOf("parent") != -1){
        filtered_data.push(data[i]);
      }
    }
    console.log(filtered_data)
    for(var i = 0; i < filtered_data.length; i++){
      const name = filtered_data[i].name;

      const displayName = name.replaceAll("mork-parent-", "");
      const selected = i == 0;
      selector.add(new Option(displayName, name, selected, selected));
    }
  });
}

function generateProject(){

  var inputElement = document.getElementById('projectname')
  if(inputElement.validity.patternMismatch){
    log("ERROR: Invalid project name. Check that it starts with an Uppercase letter followed by any alphanumeric characters or underscores (no spaces please!)");
    return;
  }
  var tag = document.getElementById('morktag').value;
  var correctName = inputElement.value;

  log("Starting generation for project " + correctName);

  // CONFIGURATION
  generateURLs(correctName, tag, buildZip);

}

function generateURLs(correctName, tag, callback){
  getJSON("https://api.github.com/repos/rmartinsanta/mork/git/trees/" + tag, (status, data) => {
    var tree = data.tree;
    var hash;
    for(var i = 0; i < tree.length; i++){
       if(tree[i].path == "template"){
         hash = tree[i].sha;
         console.log(`template folder hash for tag ${tag} is ${hash}`);
       }
    }
    if(hash){
      getJSON(`https://api.github.com/repos/rmartinsanta/mork/git/trees/${hash}?recursive=1`, (status, data) => {
        var urls = [];
        for(var i = 0; i < data.tree.length; i++){
          var item = data.tree[i];
          if(item.type === "blob"){
            var lastSlash = item.path.lastIndexOf('/');
            urls.push({
              folder: lastSlash == -1? "": item.path.slice(0, lastSlash),
              name: item.path.slice(lastSlash+1),
            });
          }
        }
        console.log("Urls: ");
        console.log(urls);
        callback(correctName, tag, urls);
      })
    } else {
      console.log(`Could not find template hash for tag ${tag}`);
    }
  });
}

function buildZip(correctName, tag, urls){
  var baseURL = 'https://raw.githubusercontent.com/rmartinsanta/mork/'+tag+'/template/';

  var zip = new JSZip();
  var count = 0;
  var mark = '__RNAME__';
  var decoder = new TextDecoder("utf-8");
  var encoder = new TextEncoder(); // Defaults to UTF-8

  urls.forEach(function(url){
    // loading a file and add it in a zip file
    var path = url.folder + '/' + url.name;
    var path = path.replaceAll('//', '/');
    var fullURL = baseURL + path;

    JSZipUtils.getBinaryContent(fullURL, function (err, data) {
      log("Downloading " + fullURL);
       if(err) {
         log("Error found while downloading " + fullURL);
         log(err);
         throw err;
       }
       var realFolder = url.folder.replaceAll(mark, correctName);
       var realFilename = url.name.replaceAll(mark, correctName);
       var decodedContent = decoder.decode(data);
       var realContent = decodedContent.replaceAll(mark, correctName);
       zip.folder(realFolder).file(realFilename, encoder.encode(realContent), {binary:true});
       count++;
       if (count == urls.length) {
         log("Generating ZIP file");
         zip.generateAsync({type:'blob'}).then(function(content) {
            log("ZIP created, saving...");
            saveAs(content, correctName + ".zip");
            log("DONE!");
         });
      }
    });
  });
}

setTags();
