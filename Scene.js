import * as THREE from 'three'

import { buildAxes } from './Axes'

export default function initScene () {

  const scene = new THREE.Scene();

  scene.fog = new THREE.FogExp2(0x000000, 0.005);

  scene.add(new THREE.AmbientLight(0xcccccc));

  const directionalLight = new THREE.DirectionalLight(0xeeeeee);
  directionalLight.position.x = Math.random() - 0.5;
  directionalLight.position.y = Math.random();
  directionalLight.position.z = Math.random() - 0.5;
  directionalLight.position.normalize();
  scene.add(directionalLight);

  const axes = buildAxes(6);
  scene.add(axes);

  const grids = new THREE.Object3D();
  const gridX = new THREE.GridHelper(20, 50);
  grids.add(gridX);
  //const gridY = new THREE.GridHelper(20, 50);
  //gridY.rotateX(Math.PI / 2);
  //grids.add(gridY);
  //const gridZ = new THREE.GridHelper(20, 50);
  //gridZ.rotateZ(Math.PI / 2);
  //grids.add(gridZ);
  scene.add(grids);

  //const clock = new THREE.Clock();
  //stats = new Stats();
  //container.appendChild(stats.dom);

  //window.addEventListener('resize', onWindowResize, false);
  //document.addEventListener('mousewheel', onDocumentMouseWheel, false);
  ////Firefox
  //document.addEventListener('DOMMouseScroll', onDocumentMouseWheel, false);
  //document.addEventListener('mousemove', onDocumentMouseMove, false);

  //document.addEventListener('mousedown', onDocumentMouseDown, false);

  //document.addEventListener('mouseup', onDocumentMouseUp, false);

  return scene

}
