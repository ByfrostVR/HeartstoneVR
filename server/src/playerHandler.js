module.exports = {
  //create player according to registration data

  createPlayer: function(username, password, playerFName,playerLName, player, answer) {
    player.create({
      username: username,
      password: password,
      playerFName: playerFName,
      playerLName: playerLName,
      wins: 0,
      losts: 0,
      money: 0
    }, function(err, p) {
      if (err) {
        answer(err,false)
      } else {
        answer(null,true);
      }
    })
  },

  //find player function for authorization
  findPlayer: function(username, password, player, found) {

    player.find({
      'password': password
    }, function(err, p) {
      if (err || p.length == 0) {
        console.log('jne');
        found(null,false);
      } else {
        console.log("je");
        found(null,true);
      }
    });
  }
}
