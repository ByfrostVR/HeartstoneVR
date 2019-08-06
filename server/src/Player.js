var mongoose = require("mongoose")

mongoose.connect("mongodb+srv://Yotam:nwonSoyPhiTkYqs7@lokidb-orjxa.mongodb.net/test?retryWrites=true&w=majority")// if error it will throw async error
//mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//player schema
var playerSchema = new mongoose.Schema({
  username: String,
  password: String,
  playerFName: String,
  playerLName: String,
  wins: Number,
  losts: Number,
  money: Number
})
//player model

module.exports = mongoose.model("players", playerSchema);
