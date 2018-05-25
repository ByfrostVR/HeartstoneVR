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
import io from 'socket.io-client';
import * as scene from './index.js'
var socket;
var playerHands = [];

export var emitEvent;

export function initSocket() {
  //document.getElementById("play").style.setProperty("visibility", "hidden");
  //document.getElementById("play").style.visibility = "hidden";
  scene.startBabylonEngine()
  socket = io('http://localhost:8000').connect();
  emitEvent = function(nameOfEvent) {
    socket.emit(nameOfEvent);
  }
  socket.on('connect', function() {
    socket.emit('start');
    emitEvent = function(nameOfEvent) {
      socket.emit(nameOfEvent);
    }
  });
  socket.on('palmRay',function(){
    //scene.activePalmRay()
    console.log('activate circle');
  })
  socket.on('editMesh', function() {
    scene.changeColor()
  })
}
