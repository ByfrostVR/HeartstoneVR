import * as BABYLON from 'babylonjs';



export function createbook(scene, distance) {
  var mesh = BABYLON.MeshBuilder.CreateBox("mesh", {
    height: 100,
    width: 20,
    depth: 40
  }, scene);
  mesh.checkCollisions = true;
  var posForBook = 0
  mesh.position = new BABYLON.Vector3(0, 100, posForBook)
  mesh.scaling = new BABYLON.Vector3(3, 2, 3);
  posForBook += distance;
  return mesh;
}
export function loadshelf(scene) {
  BABYLON.SceneLoader.ImportMesh("Bookshelf_Design_4__3_Sections_", "/assets/models/bookshelf/", "bookshelf-design-4-3-sections.babylon", scene, function(newMeshes) {
    var mesh = newMeshes[0];
    mesh.position = new BABYLON.Vector3(0, 121, 0)
    mesh.scaling = new BABYLON.Vector3(5, 5, 5);
    mesh.rotation.y = Math.PI;
    return mesh;
  })
}
export function loadcard(scene) {
  console.log("here2");
  BABYLON.SceneLoader.ImportMesh("Card", "/assets/models/heartstone/", "card.babylon", scene, function(newMeshes) {
    var card = newMeshes[0];
    card.position = new BABYLON.Vector3(20, 50, -100);
    card.scaling = new BABYLON.Vector3(80, 80, 80);
    card.rotation.y = Math.PI;
    /*
    var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
    myMaterial.diffuseTexture = new BABYLON.Texture('data:200px-Card_back-Classic.png', scene, true,
													   true, BABYLON.Texture.BILINEAR_SAMPLINGMODE,
													   null, null, image, true);
    card.material = myMaterial;
    */
    console.log(card);
    return card;
  })
}
/*
export function loadhand(scene) {
  BABYLON.SceneLoader.ImportMesh("HandModel", "/assets/models/hands/", "Hand.babylon", scene, function(newMeshes) {
    var mesh = newMeshes[0];
    mesh.position = new BABYLON.Vector3(0, 121, 0)

    mesh.scaling = new BABYLON.Vector3(5, 5, 5);
    mesh.rotation.y = Math.PI;
    return mesh;
  })
}
*/
