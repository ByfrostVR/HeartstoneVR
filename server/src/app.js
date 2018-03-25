var express = require("express")
var app = express()

import createPlayer from './createPlayer.js'
import findPlayer from './authentication.js'
import * from './createGame.js'


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

  //enable Access-Control-Allow-Origin

  //authentication
  if (findPlayer(username, password)) {
    res.send('{"status":"logged in"}');
  } else {
    res.send('{"status":"undefiened"}')
  }
  res.set({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Authorization,Content-Type,Origin,X-Requested-With",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, PUT"
  });
});

app.post('/api/v1/register', function(req, res) {
  //get user register data
  var username = req.body[0].value;
  var password = req.body[1].value
  var playerName = req.body[2].value
  createPlayer(username, password, playerName)

  //enable Access-Control-Allow-Origin
  res.set({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Authorization,Content-Type,Origin,X-Requested-With",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, PUT"
  });
});

app.post('/api/v1/joinGame', function(req, res) {
  //get user game id and the player
  var gameId= req.body[0];
  //add player to a game
  joinGame(id,player)

  //enable Access-Control-Allow-Origin
  res.set({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Authorization,Content-Type,Origin,X-Requested-With",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, PUT"
  });
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
