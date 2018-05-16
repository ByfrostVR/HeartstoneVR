//GLOBAL VARIABLES on scene.js
/*
var data;
var player1;
var player2;
var canvas;
var engine;
var scene;
var spheres = [];
var toDelete = [];
var enemyScore = 0;
var playerScore = 0;
*/
import * as creations from './creations.js';
import * as io from 'socket.io';
var socket;
var playerHands = [];

function initSocket() {
  //document.getElementById("play").style.setProperty("visibility", "hidden");
  document.getElementById("play").style.visibility = "hidden";
  console.log('here??');
  //alert('init socket')
  socket = null;
  socket = io('http://localhost:8000').connect();
  socket.on('connect', function() {
    startBabylonEngine(frame); //on baylonMultiplayer.js
    playerHands.push(leftHand)
    playerHands.push(rightHand)
    var playerData = {
      frame: frame
    }
    socket.emit('start', playerData);
  });

  socket.on('handshake1', function(data) {
    if (player2) {
      player2.dispose();
    }
    player2 = createUpdateHand(scene, data, 2);

    var playerData = {
      frame: player1.frame
    }
    socket.emit('handshake2', playerData);
  });

  socket.on('handshake3', function(data) {
    player2 = createPlayer(scene, data);
  });
  socket.on('receiveUpdate', function(data) {
    createUpdateHand(data)
  })

  socket.on('bye', function(data) {
    if (player2) {
      player2.dispose()
    }
  });

}
