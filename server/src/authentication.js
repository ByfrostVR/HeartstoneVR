var mongoose = require("mongoose")

mongoose.connect("mongodb://localhost/players")
//player schema
var playerSchema = new mongoose.Schema({
  username: String,
  password: String,
  playerName: String,
  wins: Number,
  losts: Number,
  money: Number
})
//player model
var Player = mongoose.model("Player", playerSchema);
//add a new car tp the DB

//find player function for authorization
export function findPlayer(username, password) {
  Player.find({
    username: username,
    password: password
  }, function(err, p) {
    if (err) {
      return false
    } else {
      return true
    }
  });
}
