function remove(array, element) {
  const index = array.indexOf(element);
  array.splice(index, 1);
}
//create game according to the request
module.exports = {
  createGame: function(game, rn, returnAnswer) {
    //the function needs to get a player
    game.create({
      players: 0,
      available: true,
      'roomName': rn
    }, function(err, g) {
      if (err) {
        returnAnswer(err, null)
      } else {
        g.joinGame(function(err, answer) {
          if (answer == 'added') {
            returnAnswer(null, 'created')
          } else {
            returnAnswer(null, 'the room is full')
          }
        })

      }
    })
  },
  joinGame: function(game, rn, returnAnswer) {
    game.findOne({
      'roomName': rn
    }, function(err, foundGame) {
      if (err) {
        console.log('error - ' + err);
      } else if (foundGame.length != 0) {
        foundGame.joinGame(returnAnswer, function(err, answer) {
          if (err) {
            returnAnswer(err, null)
          } else {
            returnAnswer(null, answer)
          }
        })
      } else {
        returnAnswer(null, 'not found')
      }
    })
  },
  exitGame: function(game, rn, returnAnswer) {
    game.findOne({
      'roomName': rn
    }, function(err, foundGame) {
      foundGame.exitGame(returnAnswer, function(err, answer) {
        if (err) {
          returnAnswer(err, null)
        } else {
          returnAnswer(null, answer)
        }
      })
    })
  },
  getAllGames: function(game, found) {
    results = [];
    game.find({
      'available': true
    }, function(err, games) {
      if (err) {
        console.log("o no - " + err);
        return found(err, null)
      } else if (games.length > 0) {
        games.forEach(function(game) {
          results.push(game.roomName)
        })
        return found(null, results)
      } else {
        console.log(games);
        return found(null, null)
      }
    })

  }

}
