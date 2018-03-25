var mongoose = require("mongoose")

mongoose.connect("mongodb://localhost/players")
//general game id
var id = 1;
//player schema
var playerSchema = new mongoose.Schema({
  username: String,
  password: String,
  playerName: String,
  wins: Number,
  losts: Number,
  money: Number
})
//remove funtion to use in the game schema method
function remove(array, element) {
  const index = array.indexOf(element);
  array.splice(index, 1);
}
//player model
var Player = mongoose.model("Player", playerSchema);
//game schema
var gameSchema = new mongoose.Schema({
  players: [Player],
  available: Boolean,
  id: Number
})
//join game method, which takes player and add it to the player array
gameSchema.method('joinGame', function(player) {
  if (this.players.length >= 0 && this.players.length <= 1) {
    this.players.push(player);
  }
  //if it is the last player, change the game availablity to false
  if (this.players.length == 2) {
    this.set('available', 'false')
  }

})
//exit game method, which remove player from the game
gameSchema.method('exitGame', function(player) {
remove(this.players, player);
this.set('available', 'true');
})


})
//game model
var Game = mongoose.model("Game", gameSchema);

//create game according to the request
export function createGame(player, password, playerName) {
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

export function joinGame(id,player){
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
