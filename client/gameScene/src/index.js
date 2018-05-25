import styles from './index.css';
import * as BABYLON from 'babylonjs';
import * as GUI from "babylonjs-gui";
import * as utility from "./utility.js"
import hand from './hand.js';
import * as Leap from 'leapjs';
import * as Play from 'leapjs-playback';
import * as Inspector from 'babylonjs-inspector'
import * as client from './client.js'
// import * as LeapGesture from 'leapjs-gesture'
import {
  handEntry,
  handSwipe,
  handFlip,
  handFist
} from 'leapjs-gesture'
/*
import {
  createScene,
  rightHand,
  leftHand,
  controller,
  fist,
  engine,
  camera,
  castRayAndSelectObject
}
*/

export var startBabylonEngine, activePalmRay;
export var changeColor;

window.addEventListener('DOMContentLoaded', function() {
  var hands = {
    rightHand: null,
    leftHand: null
  }
  var canvas = document.getElementById('canvas');
  var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
  var scene = new BABYLON.Scene(engine);
  var ReadyForGesture = true;
  changeColor = function() {
    var tempMesh = scene.getMeshByName('cubeOne');
    if (tempMesh) {
      var materialTemp = new BABYLON.StandardMaterial("temp", scene);
      materialTemp.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random())
      tempMesh.material = materialTemp
    }
  }

  //    *******Scene configuration*********
  var light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 1), scene);
  var camera = new BABYLON.VRDeviceOrientationFreeCamera(
    "WebVRCamera", new BABYLON.Vector3(20, 180, 180), scene);
  //camera's target
  var ground = BABYLON.MeshBuilder.CreateGround("myGround", {
    width: 10000,
    height: 10000,
    subdivsions: 10
  }, scene);
  var cubeOne = BABYLON.Mesh.CreateBox("cubeOne", 70, scene);
  cubeOne.position = new BABYLON.Vector3(-30, 100, -50)
  var redMat = new BABYLON.StandardMaterial("redMat", scene);
  redMat.diffuseColor = new BABYLON.Color3(0.11, 0.22, 0.33);
  ground.material = redMat;
  camera.setTarget(new BABYLON.Vector3(0, 100, 0))
  camera.attachControl(canvas, true);
  activePalmRay = function() {
    var length = 1000000
    if (hands.rightHand) {
      var pOrigin = hands.rightHand.palmPosition
      var pDirection = hands.rightHand.palmNormal
    } else if (hands.leftHand) {
      var pOrigin = hands.leftHand.palmPosition
      var pDirection = hands.leftHand.palmNormal
    }
    if (pOrigin && pDirection) {
      BABYLON.Vector3.Normalize(pDirection);
      if(prh) prh.dispose()
      var palmRay = new BABYLON.Ray((new BABYLON.Vector3(pOrigin[0],pOrigin[1],pOrigin[2])),new BABYLON.Vector3(pDirection[0],pDirection[1],pDirection[2]), length);
      var rayHelper = new BABYLON.RayHelper(palmRay);
      var prh;
      prh = rayHelper
      rayHelper.show(scene,new BABYLON.Color3(1, 0.22, 0.33))
    }
  }
  var selected = false;
  var currentMeshSelected, pastSelected;
  var castRayAndSelectObject = function() {
    var ray;
    //cast ray to the direction vector of the finger tip or the camera's forward vector
    if (hands[0] != undefined) {
      var origin = hands[0].fingers[1].myPoints[0];
      var forward = hands[0].fingers[1].myPoints[1];
      var mesh = hands[0];
    } else {
      var origin = camera.position;
      var mesh = camera
      var forward = new BABYLON.Vector3(0, 0, 1);
    }
    var direction = origin.subtract(forward);
    direction = BABYLON.Vector3.Normalize(direction);
    //the length of the ray
    var length = 100000;
    //the ray itself
    var ray = new BABYLON.Ray(origin, direction, length);
    //var rhelper = BABYLON.RayHelper.CreateAndShow(ray, scene, new BABYLON.Color3(1, 1, 0.1));
    //the mesh the ray hit is -
    var hit = scene.pickWithRay(ray);


    if (hit.pickedMesh) {
      //if the ray hit mesh, put it in currentMeshSelected
      currentMeshSelected = hit.pickedMesh
      if (currentMeshSelected !== undefined && currentMeshSelected !== ground && selected != true && currentMeshSelected.name != "ray" && currentMeshSelected !== pastSelected) {
        //if the mesh is defined, its not ground mesh, no other mesh is selected, the mesh isnt the ray mesh, it hasn't been selected previously
        selected = true; //mesh is selected
        pastSelected = currentMeshSelected; // past selected is this mesh
        currentMeshSelected.scaling = new BABYLON.Vector3(currentMeshSelected.scaling.x + 0.1, currentMeshSelected.scaling.y + 0.1, currentMeshSelected.scaling.z + 0.1);
        //change this mesh scailing
      } else {
        //else, return the previous mesh to its original scailing and change selected to false
        if (selected && currentMeshSelected !== pastSelected) {
          pastSelected.scaling = new BABYLON.Vector3(pastSelected.scaling.x - 0.1, pastSelected.scaling.y - 0.1, pastSelected.scaling.z - 0.1)
          if (currentMeshSelected.name != "ray") {
            pastSelected = currentMeshSelected;
          }

          selected = false;
        }
      }
    }
  }
  //check whether the player doing fist at the moment, and if he is, act due to where he is pointing at the moment
  var fist = function() {
    // if he is pointing at the ,musix box, play music
    // if (currentMeshSelected === musicBox[0] && music.isReady) {
    //   music.play()
    // }
    // //if he is pointing at the PauseBox, stop the music
    // if (currentMeshSelected === musicBox[1]) {
    //   if (music.isPause) {
    //     music.Stop();
    //   } else if (music.isPlaying) {
    //     music.Pause()
    //   }
    // }
    //if the mesh is definedm and its not the ray mesh or the ground mesh, change is color
    if (currentMeshSelected !== undefined && currentMeshSelected.name !== 'ray' && currentMeshSelected !== ground) {
      var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
      myMaterial.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
      client.emitEvent('meshSelected')
    }
  }
  // **********Leap configuration************
  var controller = new Leap.Controller({
    enableGestures: true,
    background: true,
    loopWhileDisconnected: 'true',
    useAllPlugins: 'true'
  })
  Leap.Controller.plugin('handEntry', handEntry.handEntry)
  Leap.Controller.plugin('handSwipe', handSwipe.handSwipe)
  Leap.Controller.plugin('handFlip', handFlip.handFlip)
  Leap.Controller.plugin('handFist', handFist.handFist)
  controller.use('handFist')
  controller.use('handEntry')

  //check if the player do a fist
  controller.connect();
  controller.on('handFist', (hand) => {
    console.log('fist');
    fist()
  })
  controller.on("gesture", function(gesture) {
    ReadyForGesture = !ReadyForGesture;
    switch (gesture.type) {
      case "circle":
      if(gesture.radius > 60 && gesture.duration < 500)
        client.emitEvent('circle', null)
    }
  });
  controller.on('handFound', function(hand) {})
  controller.on('connect', function() {
    console.log("Successfully connected.");
  });

  controller.on('deviceConnected', function() {
    console.log("A Leap device has been connected.");
  });

  controller.on('deviceDisconnected', function() {
    console.log("A Leap device has been disconnected.");
  });

  //controller.on('deviceFrame', function(frame) {
  //hands = utility.createUpdateHand(scene, frame, controller, hands[0], hands[1], camera)
  //});
  startBabylonEngine = function() {
    scene.executeWhenReady(function() {
      engine.runRenderLoop(function() {
        if(controller.frame().hands.length > 0){
          if(controller.frame().hands[0].type == "right"){
            hands.rightHand = controller.frame().hands[0]
          }else{
            hands.leftHand = controller.frame().hands[0]
          }
          if(controller.frame().hands[1]){
            if(controller.frame().hands[1].type == "left"){
              hands.leftHand = controller.frame().hands[1]
            }else{
              hands.rightHand = controller.frame().hands[1]
            }
          }
        }else{
          hands.leftHand = 0
          hands.rightHand = 0
        }
        //console.log(hands);
        utility.createUpdateHand(scene, controller.frame(), controller, hands, camera)
        castRayAndSelectObject()
        scene.render()
      })
    })
  }
  client.initSocket()
})
