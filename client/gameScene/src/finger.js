import * as BABYLON from 'babylonjs'

export default class finger {
  constructor(tip, dip, mcp, pip, carp, camera) {
    this.myPoints = [tip, dip, mcp, pip, carp];
    this.camera = camera
    this.firstDraw = true;
    this.line;
    this.vectorFromJson = function vectorFromJson(a) {
      var Vector = new BABYLON.Vector3(a[0], a[1], a[2]);
      Vector = Vector.multiply(new BABYLON.Vector3(-0.3, 0.3, 0.3))
      camera.attachControl(Vector, true);
      return Vector;
    }
    this.updateFinger = function updateFinger(tip, dip, mcp, pip, carp, camera) {
      this.myPoints = [tip, dip, mcp, pip, carp];
      this.camera = camera
    }
    this.toVectors = function toVectors() {
      for (var i = 0; i < this.myPoints.length; i++) {
        this.myPoints[i] = this.vectorFromJson(this.myPoints[i]);

      }
    }
    this.drawLine = function drawLine(scene) {
      this.toVectors();
      /*
      tip = tip.subtract(carp);
      dip = dip.subtract(carp);
      mcp = mcp.subtract(carp);
      pip = pip.subtract(carp);
      carp = carp.subtract(carp);
      */
      //Array of points to construct lines
      //Create lines with updatable parameter set to true for later changes
      if (this.firstDraw) {
        var line = BABYLON.MeshBuilder.CreateLines("lines", {
          points: this.myPoints,
          updatable: true
        }, scene);
        this.line = line;
        this.firstDraw = false;
        this.line.enableEdgesRendering();
      	this.line.edgesWidth = 60.0;
      	this.line.edgesColor = new BABYLON.Color4(0, 1, 0, 1);
      } else {
        var newline = BABYLON.MeshBuilder.CreateLines("lines", {
          points: this.myPoints,
          instance: this.line
        }, scene);
        newline.enableEdgesRendering();
        newline.edgesWidth = 60.0;
        newline.edgesColor = new BABYLON.Color4(Math.random(), Math.random(), Math.random(), Math.random());
      }

    }
    /*
    this.resize = function resize() {
      for (var i = 0; i < this.myPoints.length; i++) {
        this.myPoints[i].subtract(new BABYLON.Vector3(200,200,200))

        var axis = this.camera.position;
        var angle = -Math.PI / 8;
        var quaternion = new BABYLON.Quaternion.RotationAxis(axis, angle);
        this.myPoints[i].rotationQuaternion = quaternion;
        this.myPoints[i].subtract(30, 20, 30);
        //this.myPoints[i].divide(new BABYLON.Vector3(10, 10, 100))

      }
      */
  }
}
