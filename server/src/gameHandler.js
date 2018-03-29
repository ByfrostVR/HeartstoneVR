var mongoose = require("mongoose")

//mongoose.connect("mongodb://localhost/heartstone")

var Game = require('./Game');
var Player = require('./Player');
//general game id
var id = 1;
function remove(array, element) {
  const index = array.indexOf(element);
  array.splice(index, 1);
}
//create game according to the request
function createGame(player, password, playerName) {
  Game.create({
    players: [null],
    available: true,
    id: id
  }, function(err, p) {
    if (err) {
      console.log("SOMETHING WENT WRONG");
      console.log(err);
    } else {
      p.joinGame(player);
      console.log("Saved!!");
    }
  })
  id++;
}

function joinGame(id,player){
  Game.find({
    id: id,
  }, function(err, g) {
    if (err) {
      console.log(err);
    } else {
      g.joinGame(player)
    }
  });
}
