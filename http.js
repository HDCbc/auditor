const express = require("express");

// Initialize express application
const app = express();
const exec = require('child_process').exec;

app.use(express.static(__dirname));

app.listen(4000);

// open a browser window
// opn('http://localhost:4000/client.html', {app: ['C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe']});

app.get('/msg', function(req, res){
  console.log('Web call recieved /msg, starting database calls');
  const provider = req.query.provider;
  const clinic = req.query.clinic;

  res.writeHead(200, { "Content-Type": "text/event-stream",
                       "Cache-control": "no-cache" });

  const start = new Date();

  const child = exec(`node ./index.js ${provider} ${clinic}`);
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

  // close the connection when auditing is finished
  child.on('close', function (code) {
    const runTime = new Date() - start;
    console.log('runTime: ', runTime, 'ms');
    res.write('data: *' + runTime + "\n\n");
    //process.exit(0);
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

console.log('Web server running @ http://localhost:4000/client.html');

function getQueryVariable(query, variable) {
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}
