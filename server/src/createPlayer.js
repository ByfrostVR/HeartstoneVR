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
var Player = mongoose.model("Player",playerSchema);

//create player according to registration data
export function createPlayer(username, password, playerName)
Player.create({
  username: username,
  password: password,
  playerName: playerName,
  wins: 0,
  losts: 0,
  money: 0
},function(err, p){
  if(err){
    console.log("SOMETHING WENT WRONG");
    console.log(err);
  }else{
    console.log("Saved!!");
  }
})
