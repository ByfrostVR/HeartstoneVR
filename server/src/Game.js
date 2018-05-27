var mongoose = require("mongoose")

mongoose.connect("mongodb://localhost:27017/heartstone")// if error it will throw async error
//mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//game schema
//the player value needs to be list of players
var gameSchema = new mongoose.Schema({
  players: Number,
  available: Boolean,
  roomName: String
})

gameSchema.method('echo', function() {
  //remove(this.players, player);
  console.log("ay");
})

gameSchema.method('joinGame', function(success) {
  if (this.players == 0) {
    this.set({
      players: this.players + 1
    })
    this.save(function(err, updated) {
      if (err) {
        console.log('err -' + err);
      } else {
        success(null,'created')
      }
    })

    console.log('added player');
    return success(null, 'added')

  } else if (this.players == 1) {
    this.set({
      players: this.players + 1,
      available: false

    })
    this.save(function(err, updated) {
      if (err) {
        console.log('err -' + err);
      } else {
      }
    })

    console.log('added player');
    return success(null, 'added')
  } else if (this.players >= 2) {
    this.set({
      available: false
    })
    return success(null, 'full')
  } else {
    return success(null, 'something went wrong')

  }
})
gameSchema.method('exitGame', function(success) {
  this.set({
    players: this.players - 1
  })
  this.save(function(err, updated) {
    if (err) return success(err, null);
  })
  return success(null, 'exit')
})
//game model
module.exports = mongoose.model("games", gameSchema);
