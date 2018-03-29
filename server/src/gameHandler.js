var id = 1;

function remove(array, element) {
  const index = array.indexOf(element);
  array.splice(index, 1);
}
//create game according to the request
module.exports = {
  createGame: function(game, roomName) {
    //the function needs to get a player
    console.log(roomName);
    game.create({
      available: true,
      'roomName': roomName
    }, function(err, p) {
      if (err) {
        console.log("SOMETHING WENT WRONG");
        console.log(err);
      } else {
        console.log("Saved!!");
      }
    })
    id++;
  },

  joinGame: function(id, player, game) {
    Game.find({
      id: id,
    }, function(err, g) {
      if (err) {
        console.log(err);
      } else {
        g.joinGame(player)
      }
    });
  },
  getAllGames: function(game, found) {
    results = [];
    game.find({
      'available': true
    }, function(err, games) {
      if (err) {
        console.log("o no - " + err);
        found(err, null)
      } else if (games.length > 0) {
        games.forEach(function(game) {
          results.push(game.roomName)
        })
        found(null, results)
      } else {
        console.log(games);
        found(null, null)
      }
    })

  }

}
