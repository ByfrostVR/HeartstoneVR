var express = require("express")
var app = express()

var state = {};
state.loggedin = {};
state.event = [];

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
  extended: true
})); // support encoded bodies

// POST http://localhost:8080/api/users
// parameters sent with
app.post('/api/v1/login', function(req, res) {
  var username = req.body[0].value;
  //var firend_id = req.body.friend;
  var password = req.body[1].value

  state.loggedin = {
    "username": username,
    "password": password
  };

  console.log("state:")
  console.log(state);

  res.set({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Authorization,Content-Type,Origin,X-Requested-With",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, PUT"
  });

  res.send('{"status":"logged in"}');
});

app.options('/api/v1/login', function(req, res) {

  console.log("options")

  res.set({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Authorization,Content-Type,Origin,X-Requested-With",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, PUT"
  });

  res.send('{"status":"logged in"}');
});

app.post('/api/v1/play', function(req, res) {
  var event = req.body.event;

  state.event.push(event);

  console.log("state:")
  console.log(state);

  res.set({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization,content-type",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, PUT"
  });

  res.send('{"status":"recieved event"}');
});

app.listen("8000")
