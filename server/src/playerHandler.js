module.exports = {
  //create player according to registration data

  createPlayer: function(username, password, playerName, player) {
    player.create({
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
  findPlayer: function(username, password, player, found) {

    player.find({
      'password': password
    }, function(err, p) {
      if (err || p.length == 0) {
        found(null,false);
      } else {
        console.log("je");
        found(null,true);
      }
    });
  }
}
