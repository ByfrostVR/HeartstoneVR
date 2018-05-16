import * as BABYLON from 'babylonjs';
import finger from './finger';

export default class hand {
  constructor(pointables, handtype, camera, num) {
    this.pointables = pointables;
    this.handtype = handtype;
    this.myPoints;
    this.player = num;
    this.camera = camera;
    this.fingers = {};
    this.updateHand = function updateHand(pointables, handtype) {
      this.pointables = pointables;
      this.handtype = handtype;
    }
    this.correctHand = function correctHand() {
      for (var i = 0; i < this.pointables.length; i++) {
        var point = this.pointables[i]
        var fingertype = point["type"]
        if (this.player == 2) {
          var tip = point["tipPosition"].add(new BABYLON.Vector3(100, 0, 100))
          var carp = point["carpPosition"].add(new BABYLON.Vector3(100, 0, 100))
          var dip = point["dipPosition"].add(new BABYLON.Vector3(100, 0, 100))
          var mcp = point["mcpPosition"].add(new BABYLON.Vector3(100, 0, 100))
          var pip = point["pipPosition"].add(new BABYLON.Vector3(100, 0, 100))
        } else {
          var tip = point["tipPosition"]
          var carp = point["carpPosition"]
          var dip = point["dipPosition"]
          var mcp = point["mcpPosition"]
          var pip = point["pipPosition"]
        }
        if (this.fingers[fingertype] != null) {
          this.fingers[fingertype].updateFinger(tip, dip, mcp, pip, carp, this.camera)
        } else {
          this.fingers[fingertype] = new finger(tip, dip, mcp, pip, carp, this.camera)
        }
      }
    }

    this.drawHand = function drawHand(scene) {
      this.correctHand();
      for (var i = 0; i < this.pointables.length; i++) {
        this.fingers[i].drawLine(scene);
        /*
        this.myPoints = []
        var point = this.pointables[i]
        var tip = this.vectorFromJson(point["tipPosition"])
        var carp = this.vectorFromJson(point["carpPosition"])
        var dip = this.vectorFromJson(point["dipPosition"])
        var mcp = this.vectorFromJson(point["mcpPosition"])
        var pip = this.vectorFromJson(point["pipPosition"])
        this.myPoints.push(tip)
        this.myPoints.push(dip)
        this.myPoints.push(mcp)
        this.myPoints.push(pip)
        this.myPoints.push(carp)
        this.drawLine(scene);
        */
      }

    }
  }
}
