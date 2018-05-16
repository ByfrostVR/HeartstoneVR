var Player = require('./Player');
var player = require('./playerHandler.js')
var game = require('./gameHandler.js')
var Game = require('./Game.js')
var cors = require('cors')
var express = require("express")
var port = 8000;
var app = express()
var server = app.listen(port, function() {
  console.log("The server is on. Listen on port 8000");
})
var io = require('socket.io').listen(server);
var roomQueue = [];
var roomQueueFull = [];
var counterRooms = 0;
//key:value  --> key:client , value:room's client
var usersConnected = {};


io.on('connection', function (socket) {
    console.log("Client " + socket.id + " connected");
    socket.on('start', function (playerData) {
        console.log('hello')
    });

    socket.on('sendUpdate', function (data) {
        socket.broadcast.to(usersConnected[socket.id]).emit('receiveUpdate', data);
    });

    socket.on('hit', function (idSphere) {
        socket.broadcast.to(usersConnected[socket.id]).emit('spherePicked', idSphere);
    });

    socket.on('gameOver', function () {
        socket.disconnect();
    });

    socket.on('disconnect', function () {
        console.log("Client " + socket.id + " disconnected");
        var roomClientRemoved = usersConnected[socket.id];
        delete usersConnected[socket.id];

        var index = roomQueueFull.indexOf(roomClientRemoved);
        if (index > -1) {
            roomQueueFull.splice(index, 1);
            roomQueue.push(roomClientRemoved);
        } else {
            index = roomQueue.indexOf(roomClientRemoved)
            if (index > -1) {
                roomQueue.splice(index, 1)
            }
        }
        socket.broadcast.to(roomClientRemoved).emit('bye', "");
    });
});
//var mongoose = require("mongoose")
//var collections = mongoose.connections[0].collections['players']['collection'];
//var names = []

// Object.keys(collections).forEach(function(k){
//   names.push(k)
// })
//console.log(names);null
//game.createGame(Game,'gameNumber1',function(err,a){console.log(a);})
//game.createGame(Game,'gameNumber2',function(err,a){console.log(a);})
//player.createPlayer('yotam','fromm','DeathGunter',Player)
// Game.find({
//   'roomName': 'gameNumber1'
// },function(err,g){
//   //  console.log(Game.schema
//   console.log(g[0].joinGame());
// })
//player.createPlayer('test','test','Test',Player)
app.use(cors())

var rand = function() {
  return Math.random().toString(36).substr(2); // remove `0.`
};

var tokenGenerator = function() {
  return rand() + rand(); // to make it longer
};

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



io.on('connection', function(socket){
  socket.on('hi',function(data){
    console.log(data);
    socket.emit('hi', 'hello!')
  })
})

app.post('/api/v1/login', cors(issue2options), function(req, res) {
  var username = req.body[0].value;
  //var firend_id = req.body.friend;
  var password = req.body[1].value;

  //enable Access-Control-Allow-Origin
  // res.set({
  //   "Content-Type": "application/json",
  //   "Access-Control-Allow-Origin": "*",
  //   "Access-Control-Allow-Headers": "Authorization,Content-Type,Origin,X-Requested-With",
  //   "Access-Control-Allow-Methods": "GET, POST, DELETE, PUT"
  // });
  //authentication
  player.findPlayer(username, password, Player, function(err, found) {
    if (err) {
      console.log("error - " + err);
    } else if (found) {
      var token = tokenGenerator()
      res.json({
        text: '{"status":"logged in","token":"' + token + '"}'
      });
    } else {
      res.json({
        text: '{"status":"failedToLog"}'
      });
    }
  });
});

app.post('/api/v1/sayHi',cors(),function(req,res){
  req.app.io.emit('hi',{msg: 'well hello there!'})
})
app.post('/api/v1/register', cors(), function(req, res) {
  //get user register data
  var username = req.body[0].value;
  var password = req.body[1].value
  var playerName = req.body[2].value
  createPlayer.createPlayer(username, password, playerName, Player)

  //enable Access-Control-Allow-Origin
});
app.post('/api/v1/joinGame', cors(issue2options), function(req, res) {
  //get user game id and the player
  //console.log(req.body.roomName);
  roomName = req.body.roomName;
  //add player to a game
  game.joinGame(Game, roomName, function(err, answer) {
    if (err) {
      console.log(err);
    } else if (answer == 'added') {
      res.json({
        text: '{"status":"joined the game"}'
      })
    } else {
      console.log(answer);
      res.json({
        text: '{"status":"failed to join"}'
      })
    }
  })
});
app.post('/api/v1/exitGame', cors(issue2options), function(req, res) {
  //get user game id and the player
  //console.log(req.body.roomName);
  var roomName = req.body.roomName;
  //add player to a game
  game.exitGame(Game, roomName, function(err, answer) {
    if (err) {
      console.log(err);
    } else if (answer == 'exit') {
      res.json('{"status":"exited the game"}')
    } else {
      console.log(answer);
      res.json('{"status":"failed to exit"}')
    }
  })
});
app.post('/api/v1/getGames', cors(issue2options), function(req, res) {
  console.log("here");
  game.getAllGames(Game, function(err, found) {
    if (err) {
      console.log("error - " + err);
    } else if (found) {
      res.json({
        text: found
      })
    }
  });
});
app.post('/api/v1/createGame', cors(issue2options), function(req, res) {
  //get user game id and the player
  //console.log(req);
  var roomName = req.body[0].value;
  if (roomName == '' || roomName == undefined || roomName == null) {
    res.json('{"status":"failed to create"}')
  } else {
    //add player to a game
    game.createGame(Game, roomName, function(err, answer) {
      if (err) {
        console.log(err);
      } else if (answer == 'created') {
        console.log('good');
        res.json('{"status":"created the game"}')
        res.end();
      } else {
        console.log('bad');
        res.json('{"status":"failed to create"}')
        res.end();
      }

    })
  }
});
