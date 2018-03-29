var mongoose = require("mongoose")

mongoose.connect("mongodb://localhost/players");

mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//game schema
//the player value needs to be list of players
var gameSchema = new mongoose.Schema({
  players: [Number],
  available: Boolean,
  roomName: String
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

//game model
module.exports = mongoose.model("games", gameSchema);
