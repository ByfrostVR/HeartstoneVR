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
//import * as creations from './creations.js';
import io from 'socket.io-client';
import * as scene from './index.js'
var socket;
var playerHands = [];


export function initSocket() {
  //document.getElementById("play").style.setProperty("visibility", "hidden");
  //document.getElementById("play").style.visibility = "hidden";
  alert('init socket2')
  socket = io('http://localhost:8000').connect();
  socket.on('connect', function() {
    socket.emit('start');
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
