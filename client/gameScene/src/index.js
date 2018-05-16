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
import * as creations from './creations.js';

var scene;
var engine;

export function startBabylonEngine() {
  console.log("what what2?");
  if (BABYLON.Engine.isSupported()) {
    engine.displayLoadingUI();
    scene.executeWhenReady(function() {
      engine.runRenderLoop(function() {
        engine.hideLoadingUI();
        scene.render();
      });
    });
    window.addEventListener("resize", function() {
      engine.resize();
    });
  } else {
    alert("I'm sorry!");
  }
};
window.addEventListener('DOMContentLoaded', function() {
  scene = creations.createScene();
  engine = creations.engine;
  console.log("what what3?");
  client.initSocket()
  var rightHand, leftHand, currentMeshSelected, pastSelected, frame;
  var selected = false;
  var castRayAndSelectObject = function() {
    var ray;
    //cast ray to the direction vector of the finger tip or the camera's forward vector
    if (rightHand != undefined) {
      var origin = rightHand.fingers[1].myPoints[0];
      var forward = rightHand.fingers[1].myPoints[1];
      var mesh = rightHand;
    } else {
      var origin = creations.camera.position;
      var mesh = creations.camera
      var forward = new BABYLON.Vector3(0, 0, 1);
    }
    var direction = origin.subtract(forward);
    direction = BABYLON.Vector3.Normalize(direction);
    //the length of the ray
    var length = 100000;
    //the ray itself
    var ray = new BABYLON.Ray(origin, direction, length);
    //BABYLON.RayHelper.CreateAndShow(ray, scene, new BABYLON.Color3(1, 1, 0.1));
    //the mesh the ray hit is -
    var hit = scene.pickWithRay(ray);


    if (hit.pickedMesh) {
      //if the ray hit mesh, put it in currentMeshSelected
      currentMeshSelected = hit.pickedMesh
      if (currentMeshSelected !== undefined && currentMeshSelected !== creations.ground && selected != true && currentMeshSelected.name != "ray" && currentMeshSelected !== pastSelected) {
        //if the mesh is defined, its not ground mesh, no other mesh is selected, the mesh isnt the ray mesh, it hasn't been selected previously
        selected = true; //mesh is selected
        pastSelected = currentMeshSelected; // past selected is this mesh
        currentMeshSelected.scaling = new BABYLON.Vector3(currentMeshSelected.scaling.x + 1, currentMeshSelected.scaling.y + 1, currentMeshSelected.scaling.z + 1);
        //change this mesh scailing
      } else {
        //else, return the previous mesh to its original scailing and change selected to false
        if (selected && currentMeshSelected !== pastSelected) {
          pastSelected.scaling = new BABYLON.Vector3(pastSelected.scaling.x - 1, pastSelected.scaling.y - 1, pastSelected.scaling.z - 1)
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
    // if (currentMeshSelected === creations.musicBox[0] && creations.music.isReady) {
    //   creations.music.play()
    // }
    // //if he is pointing at the PauseBox, stop the music
    // if (currentMeshSelected === creations.musicBox[1]) {
    //   if (creations.music.isPause) {
    //     creations.music.Stop();
    //   } else if (creations.music.isPlaying) {
    //     creations.music.Pause()
    //   }
    // }
    //if the mesh is definedm and its not the ray mesh or the ground mesh, change is color
    if (currentMeshSelected !== undefined && currentMeshSelected.name !== 'ray' && currentMeshSelected !== creations.ground) {
      var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
      myMaterial.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
      currentMeshSelected.material = myMaterial;
    }
  }
  BABYLON.Engine.audioEngine.setGlobalVolume(0.5);
  Leap.Controller.plugin('playback', Play.playback);
  Leap.Controller.plugin('handEntry', handEntry.handEntry)
  Leap.Controller.plugin('handSwipe', handSwipe.handSwipe)
  Leap.Controller.plugin('handFlip', handFlip.handFlip)
  Leap.Controller.plugin('handFist', handFist.handFist)


  var controller = new Leap.Controller({
    enableGestures: true,
    background: true,
    loopWhileDisconnected: 'true'
  })

  controller.use('handFist')
  //check if the player do a fist
  controller.on('handFist', (hand) => {
    fist();
  })
  //if you want to use playback -
  //.use('playback', {recording: '/assets/leap-record-1.json'})
  controller.connect();
  scene.registerBeforeRender(function() {
    frame = controller.frame();
    utility.createUpdateHand(scene, frame, 1);
  });
  //before rendering cast ray and select object
  scene.registerBeforeRender(function() {
    castRayAndSelectObject();
  });

  //scene.debugLayer.show()
});
