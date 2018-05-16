import * as creations from './creations.js';
function getFollowCamera(scene, target) {
  var camera = new BABYLON.FollowCamera("myFollowCamera", new BABYLON.Vector3(490, 10, 0), scene);
  camera.heightOffset = 30;
  camera.radius = 80;
  camera.rotationOffset = 90;
  camera.cameraAcceleration = 0.05
  camera.target = target;
  return camera;
};

export function createUpdateHand(scene, frame, num) {
  var frame = controller.frame();
  if (frame.hands.length > 0) {
    if (frame.hands[0] != undefined && frame.hands[0].type == "right") {
      if (rightHand == undefined) {
        rightHand = new hand(frame.hands[0].pointables, frame.hands[0].type, creations.camera,num);
      } else {
        rightHand.updateHand(frame.hands[0].pointables, frame.hands[0].type, creations.camera);
      }
      rightHand.drawHand(scene)
      if (frame.hands[1] != undefined && frame.hands[1].type == "left") {
        if (leftHand == undefined) {
          leftHand = new hand(frame.hands[1].pointables, frame.hands[1].type, creations.camera);
        } else {
          leftHand.updateHand(frame.hands[1].pointables, frame.hands[1].type, creations.camera);
        }
        leftHand.drawHand(scene)
      }
    }
    if (frame.hands[0] != undefined && frame.hands[0].type == "left") {
      if (leftHand == undefined) {
        leftHand = new hand(frame.hands[0].pointables, frame.hands[0].type, creations.camera);
      } else {
        leftHand.updateHand(frame.hands[0].pointables, frame.hands[0].type, creations.camera);
      }
      leftHand.drawHand(scene)
      if (frame.hands[1] != undefined && frame.hands[1].type == "right") {
        if (rightHand == undefined) {
          rightHand = new hand(frame.hands[1].pointables, frame.hands[1].type, creations.camera);
        } else {
          rightHand.updateHand(frame.hands[1].pointables, frame.hands[1].type, creations.camera);
        }
        rightHand.drawHand(scene)
      }
    }
  }
  return frame;
};

function gameOver(result) {
  engine.stopRenderLoop();
  document.getElementById("gameOver").style.visibility = "visible";
  document.getElementById("gameResult").textContent = "YOU " + result;
  socket.emit('gameOver', "");
}

function createBorder(scene) {
  var meshes = [];
  var box = BABYLON.Mesh.CreateBox("box", 10.0, scene);
  box.scaling.x = 0.2
  box.scaling.z = 100
  box.position.x = 500

  box2 = box.clone();
  box2.position.x = -box.position.x

  box3 = box.clone();
  box3.rotation.y = Math.PI / 2
  box3.position.x = 0
  box3.position.z = 499, 5;

  box4 = box3.clone();
  box4.position.z = -box3.position.z

  meshes.push(box);
  meshes.push(box2);
  meshes.push(box3);
  meshes.push(box4);

  var border = BABYLON.Mesh.MergeMeshes(meshes);
  border.material = new BABYLON.StandardMaterial("ground", scene);
  border.material.diffuseColor = new BABYLON.Color3(0.529, 0.808, 0.922)
  border.material.specularColor = new BABYLON.Color3(0, 0, 0)
  return border;
}
