// @ts-nocheck
import * as THREE from 'three'

export function loadModel (jsoncontent) {
  var loader = new THREE.AssimpJSONLoader();
  if (object != null) { scene1.remove(object) }
  if (mesh != null) { scene1.remove(mesh) }
  object = loader.parse(jsoncontent);
  object.scale.multiplyScalar(SCALE);
  scene1.add(object);
  objects.push(object);
  render();
  animate();
}

//STL

function loadSTL(stlpath) {
  var loader = new THREE.STLLoader();
  loader.load('./STLFile/File.stl', function (geometry) {
    if (mesh != null) { scene1.remove(mesh) }
    if (object != null) { scene1.remove(object) }
    var material = new THREE.MeshNormalMaterial();
    mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(0.1, 0.1, 0.1);
    scene1.add(mesh);
    render();
    animate();
  });
}

//DAE
function loadDAE() {

  var loader = new THREE.ColladaLoader();
  loader.load("./DAEFile/File.dae", function loadCollada(collada) {
    var model = collada.scene;
     
    model.updateMatrix();
    scene1.add(model);
    render();
    animate();
  });
}

//PLY

function loadPLY() {
  var loader = new THREE.PLYLoader();
  loader.load('./PLYFile/File.ply', function (geometry) {
    geometry.computeVertexNormals();
    var material = new THREE.MeshStandardMaterial({ color: 0x0055ff, flatShading: true });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 0;
     mesh.scale = 2;
    mesh.position.z = 0;
    mesh.rotation.x = 0;
    mesh.scale.multiplyScalar(7);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene1.add(mesh);
  });
}

//// instantiate a loader
//var loader = new THREE.ColladaLoader();

//loader.load(
//  // resource URL
//  './DAEFile/File.dae',
//  // Function when resource is loaded
//  function (collada) {
//    scene.add(collada.scene);
//  },
//  // Function called when download progresses
//  function (xhr) {
//    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
//  }
//);


