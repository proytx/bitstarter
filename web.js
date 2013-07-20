var express = require('express');
// need to add Node filesystem support
var objFs = require('fs');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  // Open the file buffer (can handle more than just ascii)
  var objBufFile = objFs.readFileSync('index.html');
  // Commented out for HW 3 index.html input
  //response.send('Hello World2!');
  // Added this line instead to send response back from index.html
  // Docs say default encoding is UTF-8
  response.send(objBufFile.toString());
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
