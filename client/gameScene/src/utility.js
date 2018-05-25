import hand from './hand.js'
export function createUpdateHand(scene, frame, controller, hands, camera) {
  if (frame.hands.length > 0) {
    if (frame.hands[0] != undefined && frame.hands[0].type == "right") {
      if (hands[0] == undefined) {
        hands[0] = new hand(frame.hands[0].pointables, frame.hands[0].type, camera);
      } else {
        hands[0].updateHand(frame.hands[0].pointables, frame.hands[0].type, camera);
      }
      hands[0].drawHand(scene)
      if (frame.hands[1] != undefined && frame.hands[1].type == "left") {
        if (hands[1] == undefined) {
          hands[1] = new hand(frame.hands[1].pointables, frame.hands[1].type, camera);
        } else {
          hands[1].updateHand(frame.hands[1].pointables, frame.hands[1].type, camera);
        }
        hands[1].drawHand(scene)
      }
    }
    if (frame.hands[0] != undefined && frame.hands[0].type == "left") {
      if (hands[1] == undefined) {
        hands[1] = new hand(frame.hands[0].pointables, frame.hands[0].type, camera);
      } else {
        hands[1].updateHand(frame.hands[0].pointables, frame.hands[0].type, camera);
      }
      hands[1].drawHand(scene)
      if (frame.hands[1] != undefined && frame.hands[1].type == "right") {
        if (hands[0] == undefined) {
          hands[0] = new hand(frame.hands[1].pointables, frame.hands[1].type, camera);
        } else {
          hands[0].updateHand(frame.hands[1].pointables, frame.hands[1].type, camera);
        }
        hands[0].drawHand(scene)
      }
    }
  }
  return hands;
};

function gameOver(result) {
  engine.stopRenderLoop();
  document.getElementById("gameOver").style.visibility = "visible";
  document.getElementById("gameResult").textContent = "YOU " + result;
  socket.emit('gameOver', "");
}
