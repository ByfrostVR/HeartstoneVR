module.exports = {
//create player according to registration data

  createPlayer: function(username, password, playerName, playerSchema) {
    playerSchema.create({
      username: username,
      password: password,
      playerName: playerName,
      wins: 0,
      losts: 0,
      money: 0
    }, function(err, p) {
      if (err) {
        console.log("SOMETHING WENT WRONG");
        console.log(err);
      } else {
        console.log("Saved!!");
      }
    })
  },

  //find player function for authorization
  findPlayer: function(username, password, player) {
    console.log(username + ' ' + password);
    var bool = false
    player.find({
    }, function(err, p) {
      if (err || p.length == 0) {
        console.log(err);
        bool = false
      } else {
        bool = true
      }
    });
    return bool
  }
}
