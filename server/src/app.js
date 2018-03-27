var player = require('./playerHandler.js')
var game = require('./gameHandler.js')
var cors = require('cors')
var express = require("express")
var app = express()

var Player = require('./Player');

app.use(cors())

var issue2options = {
  origin: true,
  methods: ['POST'],
  credentials: true,
  maxAge: 3600
};
app.options('/issue-2', cors(issue2options));

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

app.post('/api/v1/login', cors(issue2options), function(req, res) {
  var username = req.query.username;
  //var firend_id = req.body.friend;
  var password = req.query.password;

  //enable Access-Control-Allow-Origin
  // res.set({
  //   "Content-Type": "application/json",
  //   "Access-Control-Allow-Origin": "*",
  //   "Access-Control-Allow-Headers": "Authorization,Content-Type,Origin,X-Requested-With",
  //   "Access-Control-Allow-Methods": "GET, POST, DELETE, PUT"
  // });
  //authentication
  console.log(player.findPlayer(username, password, Player));
  if (player.findPlayer(username, password, Player) == true) {
    res.json({
      text: '{status:"logged in"}'
    });
  } else {
    res.json({
      text: '{status:"logged in"}'
    });
  }
});

app.post('/api/v1/register', function(req, res) {
  //get user register data
  var username = req.body[0].value;
  var password = req.body[1].value
  var playerName = req.body[2].value
  createPlayer.createPlayer(username, password, playerName, Player)

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
  var gameId = req.body[0].value;
  console.log(gameId);
  //add player to a game
  //game.joinGame(id,player)

  //enable Access-Control-Allow-Origin
  res.set({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Authorization,Content-Type,Origin,X-Requested-With",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, PUT"
  });
  res.send(gameId)
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

  res.send('{"status":"event"}');
});
app.listen(8000, function() {
  console.log("The server is on. Listen on port 8000");
})
