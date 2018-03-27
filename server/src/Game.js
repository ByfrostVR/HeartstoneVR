var mongoose = require("mongoose")

var ObjectId = mongoose.SchemaTypes.ObjectId;
//game schema
var gameSchema = new mongoose.Schema({
  players: [{type: ObjectId, ref: Player}],
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

//game model
var Game = mongoose.model("Game", gameSchema);

module.export = Game;
