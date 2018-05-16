import styles from './index.css';
import * as BABYLON from 'babylonjs';
import * as GUI from "babylonjs-gui";
import hand from './hand.js';
import * as Leap from 'leapjs';

export var scene, ground, selected, ray, camera, rightHand, leftHand, pastSelected;
//export var musicBox = [];
//var mouseOnly = false;
var currentMeshSelected = null;
var canvas = document.getElementById('canvas');
export var engine = new BABYLON.Engine(canvas, true);
var hands = {};

var controller = new Leap.Controller({
  enableGestures: true,
  background: true,
  loopWhileDisconnected: 'true'
})
//creating scene, its properties and objects
export function createScene() {
  //creating scene
  scene = new BABYLON.Scene(engine);
  //initializing music
  // music = new BABYLON.Sound("Music", "./assets/music/imTheOne.wav", scene)
  //enabling phisics
  //scene.enablePhysics();
  //enable collisions
  //scene.collisionsEnabled = true;
  //creating camera
  //createCamera();
  //creating light
  //createLight();
  //creating ground
  //createGround();
  //will be used in the future createCard();

  //creatng music box
  //createMusicBoxes();
  //creating GUI
  //createGUI();
  return scene;
}

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
  ground = BABYLON.Mesh.CreateGround("ground", 1000, 1000, 0, scene, false);
  //the material
  var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
  groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
  groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
  ground.material = groundMaterial;
  //properties
  ground.receiveShadows = true;
  ground.physicsImpostor = new BABYLON.PhysicsImpostor(
    ground, BABYLON.PhysicsImpostor.BoxImpostor, {
      mass: 0,
      restitution: 0.9
    },
    scene
  );
}

//creating camera
var createCamera = function() {
  //vr camera and its position
  camera = new BABYLON.VRDeviceOrientationFreeCamera(
    "WebVRCamera", new BABYLON.Vector3(0, 190, 300), scene);
  //camera's target
  camera.setTarget(new BABYLON.Vector3(0, 190, 0))
  camera.checkCollisions = true;
  camera.attachControl(canvas, true);
}
