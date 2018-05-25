import styles from './index.css';
import * as BABYLON from 'babylonjs';
import * as GUI from "babylonjs-gui";
import * as utility from "./utility.js"
import hand from './hand.js';
import * as Leap from 'leapjs';
import * as Play from 'leapjs-playback';
import * as Inspector from 'babylonjs-inspector'
import * as client from './client.js'
import * as index from './index.js'
// import * as LeapGesture from 'leapjs-gesture'
import {
  handEntry,
  handSwipe,
  handFlip,
  handFist
} from 'leapjs-gesture'
var scene, ground, selected, ray, rightHand, leftHand, pastSelected, frame;
//export var musicBox = [];
//var mouseOnly = false;
var currentMeshSelected = null;
var hands = {};
export var controller = new Leap.Controller({
  enableGestures: true,
  background: true,
  loopWhileDisconnected: 'true',
  optimizeHMD: 'true'
})
//creating music box
var createMusicBoxes = function() {
  //the object and parameters
  musicBox[0] = BABYLON.MeshBuilder.CreateBox("MusicBox", {
    height: 70,
    width: 70
  }, scene);
  //setting the position
  musicBox[0].position = new BABYLON.Vector3(-50, 50, -100);

  musicBox[1] = BABYLON.MeshBuilder.CreateBox("PauseBox", {
    height: 70,
    width: 70
  }, scene);
  musicBox[1].position = new BABYLON.Vector3(50, 50, -100);
}
//creating light
var createLight = function() {
  //ligth object
  var light = new BABYLON.DirectionalLight("dir01",
    new BABYLON.Vector3(-0, -1, -1.0), scene);
  //light position
  light.position = new BABYLON.Vector3(50, 250, 200);
  //light.shadowOrthoScale = 2.0;
}

//creating gui  - a dot at the screen to see where we are looking
var createGUI = function() {
  var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
  var ellipse = new BABYLON.GUI.Ellipse();
  ellipse.width = "5px"
  ellipse.height = "5px";
  ellipse.thickness = 1;
  ellipse.background = "Red";
  advancedTexture.addControl(ellipse);

}


//creating ground and set its parameters

var createGround = function() {
  //the object
  ground = BABYLON.MeshBuilder.CreateGround("myGround", {
    width: 100,
    height: 100,
    subdivsions: 100
  }, scene);

  //   //the material
  //   var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
  //   groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  //   groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
  //   ground.material = groundMaterial;
  //   //properties
  //   ground.receiveShadows = true;
  //   ground.physicsImpostor = new BABYLON.PhysicsImpostor(
  //     ground, BABYLON.PhysicsImpostor.BoxImpostor, {
  //       mass: 0,
  //       restitution: 0.9
  //     },
  //     scene
  //   );
  // }
  return ground;
}
//creating camera
export var createCamera = function(canvas) {
  //vr camera and its position
  //camera = new BABYLON.VRDeviceOrientationFreeCamera(
  //  "camera", new BABYLON.Vector3(0, 190, 300), scene);
  //camera's target
  var camera = new BABYLON.WebVRFreeCamera("vrcamera", new BABYLON.Vector3(0, 14, 0), scene, true, {
    trackPosition: false
  });
  camera.setTarget(new BABYLON.Vector3(0, 190, 0))
  //camera.checkCollisions = true;
  camera.attachControl(canvas, true);
  return camera;
}
//creating scene, its properties and objects
export function createScene(engine, canvas) {
  //creating scene
  scene = new BABYLON.Scene(engine);
  //initializing music
  // music = new BABYLON.Sound("Music", "./assets/music/imTheOne.wav", scene)
  //enabling phisics
  scene.enablePhysics();
  //enable collisions
  scene.collisionsEnabled = true;
  //creating camera

  //creating light
  createLight();
  //creating ground
  var ground = createGround();
  var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {
    diameter: 2
  }, scene);
  //alert('ground')
  //will be used in the future createCard();

  //creatng music box
  //createMusicBoxes();
  //creating GUI
  createGUI();
  return scene
}
