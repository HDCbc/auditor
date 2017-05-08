const express = require("express");
const opn = require('opn');

// Initialize express application
const app = express();
const exec = require('child_process').exec;

app.use(express.static(__dirname));

app.listen(4000);

// open a browser window
opn('http://localhost:4000/client.html');

app.get('/msg', function(req, res){

  res.writeHead(200, { "Content-Type": "text/event-stream",
                       "Cache-control": "no-cache" });

  const child = exec('node ./index.js');
  let str = "";

  child.stdout.on('data', function (data) {
      str += data.toString();

      // Flush out line by line.
      var lines = str.split("\n");
      for(var i in lines) {
          if(i == lines.length - 1) {
              str = lines[i];
          } else{
              // Note: The double-newline is *required*
              console.log(lines[i] + "\n\n");
              res.write('data: ' + lines[i] + "\n\n");
          }
      }
  });

  child.on('close', function (code) {
    //  res.end(str);
  });

  child.stderr.on('data', function (data) {
    str += data.toString();

    // just so we can see the server is doing something
    console.log(`error: ${data}`);

    // Flush out line by line.
    var lines = str.split("\n");
    for(var i in lines) {
        if(i == lines.length - 1) {
            str = lines[i];
        } else{
            // Note: The double-newline is *required*
            res.write('data: ' + lines[i] + "\n\n");
        }
    }
  });
});
