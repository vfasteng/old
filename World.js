import * as _ from './JSUtils';
import { EventBus } from '../GlobalEventBus';

const MouseTrap = require('mousetrap');

// Three
import * as THREE from 'three';
import { Vector2, Raycaster, Vector3 } from 'three';
import CameraSaver from './CameraSaver';
import './ThreeDragControls';
import './TransformControls'
import './ThreeEditorControls';
import './Projector';

// 3D Utils
import { normaliseCenter, normaliseObject, scaleMesh } from './NormaliseMesh';
import FaceUtils from '../gl/FaceUtils'
import { getPointInBetweenByPerc } from './GeometryUtils';

import initScene from './Scene';
import Viewport from './Viewport';

// Selection
import VertexSelector from './VertexSelector';

// Group
import { makeGroup, flattenToGroup } from './Group'
import {
    decomposeGroup,
    getAllChildrenInAllGroups,
    groupUnion,
    groupWrapperFromId,
    groupWrapperFromObject,
    updateGroups,
    getAllGroups,
} from './Group';


// Commands
import {
  ToggleTransformModeCommand,
  GroupCommand,
  LockGroupCommand,
  FocusCommand,
  SelectGroupCommand
} from './WorldCommands';

// Physics
import { PhysicsWorld } from './Physics/Physics';
import { RigidBody, SHAPES } from './Physics/RigidBody';
import { 
  BallConstraintFactory, 
  OffsetConstraintFactory,
  PathConstraintFactory
} from './Physics/ConstraintSystem/ConstraintFactory';
import * as SF from './Physics/ShapeFactory';

//Physics new
import ConeTwistConstraint from physics-module
 import HingeConstraint from physics-module
 import PointConstraint from physics-module
 import SliderConstraint from physics-module
 import DOFConstraint from physics-module
  



// Debug
import DebugTextRenderer from './DebugTextRenderer';
import DebugHUDRenderer from './DebugHUDRenderer';
const DbgDraw = require('./three-debug-draw/index')(THREE);


import AssimpJSONLoader from './AssimpJSONLoader'
import HUDRenderer from './HUDRenderer';
import { GroupMutateFacade } from './UIBridge/MutateFacade';
import { COLORS } from './Colors';
import { SaveLoad } from './SaveLoad';


export const LOADERS = {
  AssimpJSON: new AssimpJSONLoader()
}

export default class World {

  constructor () {

    this.selectionModes = {
      FACE: 0,
      EDGE: 1,
      VERTEX: 2,
      OBJECT: 3,
      TRANSFORM: 4,
      CREATE_BALL_JOINT: 5,
      CREATE_PATH_CONSTRAINT: 6,
      SELECT_CONSTRAINT: 7
    };

    this.selectionModeDisplayNames = {};

    this.selectionModeDisplayNames[this.selectionModes.FACE] = 'Select: Face';
    this.selectionModeDisplayNames[this.selectionModes.EDGE] = 'Select: Element';
    this.selectionModeDisplayNames[this.selectionModes.VERTEX] = 'Select: Node';
    this.selectionModeDisplayNames[this.selectionModes.OBJECT] = 'Select: Object';
    this.selectionModeDisplayNames[this.selectionModes.TRANSFORM] = 'Transform';
    this.selectionModeDisplayNames[this.selectionModes.CREATE_BALL_JOINT] = 'Define Ball Joint';
    this.selectionModeDisplayNames[this.selectionModes.CREATE_PATH_CONSTRAINT] = 'Choose Constrained Object';
    this.selectionModeDisplayNames[this.selectionModes.SELECT_CONSTRAINT] = "Select: Constraint"

    MouseTrap.bind('3 3', ()=> {

      this.DbgText.toggleVisible();
      this.DbgHud.toggleVisible();

    });

    MouseTrap.bind('4 4', ()=>{
      
      this.DbgDraw.toggleDisplayOnTop();

    });

    MouseTrap.bind('esc', ()=>{

      this.cancel();

    });

    MouseTrap.bind('del', ()=>{

      this.deleteSelection();

    })


    this.selectionMode = this.selectionModes.OBJECT;

    this.scene = initScene();
    
    this.physics = new PhysicsWorld();

    const logoTexture = new THREE.TextureLoader().load('static/fast-logo.jpg');
    const aspect = 2.5283;
    const height = 1;
    const geometry = new THREE.PlaneGeometry(height*aspect, height);
    //const material = new THREE.MeshBasicMaterial({color: 0x555555});
    const material = new THREE.MeshBasicMaterial({map: logoTexture});
    material.map.needsUpdate = true;
    this._groundSurface = new THREE.Mesh(geometry, material);
    this._groundSurface.rotation.x = -0.5 * Math.PI;
    // Stop z fighting with grid.
    this._groundSurface.position.y = 0.01;
    this.scene.add(this._groundSurface);

    this._groundRb = new RigidBody(this.physics, {
      shape: SF.createBoxShape(new THREE.Vector3(50, 50, 50)),
      // Zero mass means static.
      mass: 0.0,
      position: new THREE.Vector3(0, -50, 0),
      rotation: this._groundSurface.quaternion,
      collisionGroup: "default",
      collidesWithAll: true 
    });    


    this.VertexSelector = new VertexSelector(this);
    // TODO: Refactor this out of the world class like the vertex selector.
    this.selectedEdgeVerts = [];
    this.selectedEdgeOwner = undefined;

    var originSphereGeom = new THREE.SphereGeometry( 0.1, 16, 16 );
    var originSphereMat = new THREE.MeshBasicMaterial( {color: 0xffffff} );
    this.originSphere = new THREE.Mesh( originSphereGeom, originSphereMat );
    this.originSphere.scale.set(1,1,1);
    this.originSphere.position.set(0,0,0);
    this.scene.add(this.originSphere);

    // Physics Dragging
    this.mouseStartX = 0;
    this.mouseStartY = 0;
    this.lastMousePosX = 0;
    this.lastMousePosY = 0;
    this.startedMouseDownInGroup = false;
    this.currentlyDraggingGroup = false;
    this.groupWeAreDragging = undefined;
    this.dragRayCaster = new THREE.Raycaster();
    this.dragPlane = new THREE.Plane();

    // Debug drawing
    this.DbgDraw = DbgDraw;
    this.DbgDraw.setVisible(true);
    this.DbgDraw.toggleDisplayOnTop();
    this.DbgText = new DebugTextRenderer();
    this.DbgHud = new DebugHUDRenderer();
    this.HudRenderer = new HUDRenderer();

    // Constraints
    this.BallConstraintFactory = new BallConstraintFactory(this.physics);
   // this.OffsetConstraintFactory = new OffsetConstraintFactory(this.physics);
    this.PathConstraintFactory = new PathConstraintFactory(this.physics);

    this.viewports = new Set();

    this.paused = false;

    this.selectedGroups = new Set();
    this.selectedConstraintVis = undefined;

    this.saveLoad = new SaveLoad();

    this.tick();
  }

  firstSelectedGroup() {

    return this.selectedGroups.values().next().value;

  }

  pushCommand(command) {


    // TODO: command queue and undo.
    command.execute();

  }

  tick (t = performance.now()) {

    if (this.lastTick) {

      const since = t - this.lastTick
      this.physics.tick(60)
      this.physics.constraintVis.updateScene(this.scene);
      
      updateGroups();

      if(this.currentlyDraggingGroup) {

        this.dragGroupUpdate();

      }

      DbgDraw.render(this.scene);      

      
      let totalFaces = 0;

      const sumRenderInfo = {
        faces: 0,
        verts: 0,
        geoms: 0
      };

      this.viewports.forEach((viewport) => {

        const renderInfo = viewport.render();
        
        sumRenderInfo.faces += renderInfo.render.faces,
        sumRenderInfo.verts += renderInfo.render.vertices,
        sumRenderInfo.geoms += renderInfo.memory.geometries

      });

      this.DbgText.update();
      this.DbgHud.draw(sumRenderInfo);
      this.HudRenderer.draw({
        text: this.selectionModeDisplayNames[this.selectionMode],
        width: this.mainViewport.width,
        height: this.mainViewport.height
      });

      if(this.selectionMode === this.selectionModes.CREATE_BALL_JOINT || this.selectionMode === this.selectionModes.VERTEX) {
        this.VertexSelector.update();
      } else if(this.selectionMode === this.selectionModes.EDGE) {
        this.updateSelectionCylinder();
      }

      this.lastTick = t
      if (!this.paused) requestAnimationFrame(t => this.tick(t))
    } else {
      this.lastTick = t
    }
  }

  onResize() {
    this.viewports.forEach(viewport => {
        viewport.resize()
    });    
  }



  viewport (canvas, isMainViewport) {
    const viewport = new Viewport(canvas, this.scene);
    this.viewports.add(viewport);

    if(isMainViewport) {
      
      this.mainViewport = viewport;

      const canvas = document.getElementById('mainCanvas');

      this.controls = new THREE.EditorControls(viewport.camera, canvas);
          
      this.controls.enabled = true;
      this.controls.center = new THREE.Vector3();
      this.controls.panSpeed = 0.001;
      this.controls.zoomSpeed = 0.001;
      this.controls.rotationSpeed = 0.005;
      this.controls.focus(this.originSphere);

      this.cameraSaver = new CameraSaver();
      this.cameraSaver.saveOriginal(viewport.camera, this.controls);

      this.transformControls = new THREE.TransformControls(viewport.camera, canvas);
      this.scene.add(this.transformControls);
    }

    return viewport
  }

  add (data, name) {
    
    // @ts-ignore
    const object = LOADERS.AssimpJSON.parse(JSON.parse(data));
    const group = flattenToGroup(object, this.scene);

    if(!_.isNullOrWhitespace(name)) {
      group.eachChild(child => {
        child.name = name;
      });
    }

    let height = 0;

    group.initPhysics(this.physics, true);

  }

  // Add primitives from the console for quick debugging without models.
  addPrimitive(type, config) {

    let obj;

    switch(type) {
      case("box"):
        const w = config.w ? config.w : 1;
        const h = config.h ? config.h : 1;
        const d = config.d ? config.d : 1;
        let geom = new THREE.BoxGeometry(w,h,d);
        let material = new THREE.MeshPhongMaterial({color: COLORS.OBJECT_BASE_COLOR});
        material.vertexColors = THREE.FaceColors;
        obj = new THREE.Mesh(geom, material);
        obj.name = "Primitive Box";
        obj.shape = SF.createBoxShape(new THREE.Vector3(w/2,h/2,d/2));
      break;
      case("sphere"):
        const r = config.r ? config.r : 1;
        let geomSphere = new THREE.SphereGeometry(r, 32, 23);
        let materialSphere = new THREE.MeshPhongMaterial({color: COLORS.OBJECT_BASE_COLOR});
        materialSphere.vertexColors = THREE.FaceColors;
        obj = new THREE.Mesh(geomSphere, materialSphere);
        obj.name = "Primitive Sphere";
        obj.shape = SF.createSphereShape(r);
      break;
    }
    
    
    const group = makeGroup([obj], this.scene);

    group.obj.position.x = config.x ? config.x : 0;
    group.obj.position.y = config.y ? config.y : 0;
    group.obj.position.z = config.z ? config.z : 0;


    group.initPhysics(this.physics);

  }


  getGroups() {
    return getAllGroups();
  }

  // TODO: Refactor this out of world.
  __ensureFaceTools(geometry) {

    // FaceUtils is leaving state behind so it needs to be reinstantiated every time.
    // TODO: Fix the state leak so we only need one new object per geometry.
    geometry.faceTools = new FaceUtils();
    return geometry.faceTools;
  }

  updateSelectionCylinder() {

    if(this.selectedEdgeOwner && this.selectedEdgeVerts.length === 2) {

      const v1 = this.selectedEdgeVerts[0].vector.clone().applyMatrix4(this.selectedEdgeOwner.matrixWorld);
      const v2 = this.selectedEdgeVerts[1].vector.clone().applyMatrix4(this.selectedEdgeOwner.matrixWorld);

      this.moveSelectionCylinder(v1, v2);

    }
  }

  moveSelectionCylinder(v1, v2) {

    if(this.edgeSelectCylinder) {
      this.scene.remove(this.edgeSelectCylinder);
    }

    var edgeNorm = v2.clone().sub(v1).normalize();

    var cylinderGeometry = new THREE.CylinderGeometry( 0.01, 0.01, v1.distanceTo(v2), 8 );
    var cylindermaterial = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    this.edgeSelectCylinder = new THREE.Mesh( cylinderGeometry, cylindermaterial );

    this.edgeSelectCylinder.position.copy(getPointInBetweenByPerc(v1, v2, 0.5));
    var axis = new THREE.Vector3(0, 1, 0);
    this.edgeSelectCylinder.quaternion.setFromUnitVectors(axis, edgeNorm);
  

    this.scene.add( this.edgeSelectCylinder );

  }


  makeObjColor(obj, color) {

    if(obj.geometry) {

      obj.geometry.faces.forEach(f => f.color.setHex(color));
      obj.geometry.colorsNeedUpdate = true;

    }

    if(obj.children.length) {

      obj.children.forEach(child => this.makeObjColor(child, color));

    }

  }

  selectObject(obj, multiselect) {

    var group = groupWrapperFromObject(obj);

    this.selectGroup(group, multiselect);

  }

  selectGroup(group, multiselect) {

    if(!multiselect) {
      this.removeOldSelection();
    }

    this.selectedGroups.add(group);

    group.eachChild(obj => {
      obj.isSelected = true;
      this.makeObjColor(obj, COLORS.SELECTED_COLOR);
    });

    console.log(group);

  }

  group(groups) {

    if(!groups.length) return;
    
    if(groups.length === 1) {
      this.removeOldSelection();
      decomposeGroup(groups[0], this.scene, this.physics);
      return;
    }

    var workingGroup = groups[0];

    let fixed = groups[0].isFixed();

    for(var i = 1; i < groups.length; i++) {
      
      fixed = groups[i].isFixed();

      workingGroup = groupUnion(workingGroup, groups[i], this.scene);
    }

    var final = workingGroup;

    if(fixed) {

      final.setBodyFixed(true);

    }

    final.initPhysics(this.physics);

    this.removeOldSelection();

    this.selectObject(final.obj, false);

  }

  groupSelection() {

    var toGroup = Array.from(this.selectedGroups);
    
    this.pushCommand(new GroupCommand(this, {groups: toGroup})); 
    
  }

  mutateObjectForDeselection(obj) {

    obj.isSelected = false;
    this.makeObjColor(obj, COLORS.OBJECT_FACE_COLOR);

  }

  deselectObject(obj) {

    const group = groupWrapperFromObject(obj);
    group.eachChild(child => this.mutateObjectForDeselection(child) );
    this.selectedGroups.delete(group);

  }


  resetTransformControls() {

    if(this.transformControls.object) {
      groupWrapperFromObject(this.transformControls.object).enablePhysics();
    }

    this.transformControls.detach();

  }

  selectGroupForTransform(groupWrapper) {

    this.hideSelectionWidgets();

    this.resetTransformControls();
    
    this.transformControls.attach(groupWrapper.obj);

    if(groupWrapper.physicsEnabled()) {
      groupWrapper.disablePhysics();
    }

  }

  setSelectionMode(mode) {

    if(mode === this.selectionModes.TRANSFORM) {
      
      const selectedGroup = this.firstSelectedGroup();

      if(selectedGroup) {

        this.selectGroupForTransform(selectedGroup);

      }

    } else {

      this.resetTransformControls();

    }

    this.selectionMode = mode;
  }

  
  worldToScreen(obj) {

    let width = this.mainViewport.width, height = this.mainViewport.height;
    let widthHalf = width / 2, heightHalf = height / 2;

    let vector = new THREE.Vector3();
    let projector = new THREE.Projector();
    vector.setFromMatrixPosition( obj.matrixWorld );
    vector.project(this.mainViewport.camera);

    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;

    return vector;
    
  }


  hideSelectionWidgets() {
    
    this.VertexSelector.hideSelectionSphere();

    if(this.edgeSelectCylinder) {
      this.scene.remove( this.edgeSelectCylinder );
    }

  }

  removeOldSelection() {

    this.selectedGroups.forEach(group=>{
        // When we remove the selection at the end of the frame we cannot guarantee that
        // all the selected groups will still be active. Some may be destroyed.
        if(group.isAlive()) {
          group.eachChild(child => this.mutateObjectForDeselection(child));
        }
    });

    this.selectedGroups.clear();

    this.hideSelectionWidgets();

    if(this.selectedConstraint) {
      this.selectedConstraint = null;
    }
    if(this.selectedConstraintVis) {
      this.makeObjColor(this.selectedConstraintVis, COLORS.CONSTRAINT_COLOR);
    }
  }

  allObjs() {
    return getAllChildrenInAllGroups();
  }

  isDrag(event) {
    
    const deltaX = event.clientX - this.mouseStartX;
    const deltaY = event.clientY - this.mouseStartY;

    // Total mouse movement squared was less than 4 pixels squared.
    return deltaX * deltaX + deltaY * deltaY > 4;

  }

  getClickIntersects(event) {
    
    const x =   (event.clientX / this.mainViewport.width)  * 2 - 1
    const y = - (event.clientY / this.mainViewport.height) * 2 + 1

    const raycaster = new Raycaster()
    raycaster.setFromCamera(new Vector2(x, y), this.mainViewport.camera)

    let objects;
    if(this.selectionMode === this.selectionModes.SELECT_CONSTRAINT) {
      objects = this.physics.constraintVis.getVisualisationsForRaycast();
    } else {
      objects = getAllChildrenInAllGroups();
    }
    
    const intersects = raycaster.intersectObjects(objects, true);

    return intersects;
    
  }

  handleMouseDown(event) {

    this.mouseStartX = event.clientX;
    this.mouseStartY = event.clientY;

    const intersects = this.getClickIntersects(event);

    if(this.selectionMode !== this.selectionMode.SELECT_CONSTRAINT  && intersects[0]) {
    
      if(intersects[0].object.userData.groupId) {

        this.groupWeAreDragging = groupWrapperFromObject(intersects[0].object);

        this.startedMouseDownInGroup = true;

        this.dragPlane.setFromNormalAndCoplanarPoint( 
          this.mainViewport.camera.getWorldDirection( this.dragPlane.normal ), 
          intersects[0].object.position);

      } else {
        this.startedMouseDownInGroup = false;
      }
    }

    this.transformControls.onPointerDown(event);

  }

  handleMouseUp(event) {


    this.startedMouseDownInGroup = false;
    this.currentlyDraggingGroup = false;

    if(!this.isDrag(event)) {
      this.handleClick(event);
    }

  }
  
  handleClick(event) {

    const intersects = this.getClickIntersects(event);

    if(event.button === 0) {
        this.leftClick(intersects, event);
    } else if(event.button === 2) {
        this.rightClick(intersects, event);
    }

  }

  handleMouseMove(event) {

    this.lastMousePosX = event.clientX;
    this.lastMousePosY = event.clientY;

    // Transform takes priority if it is enabled.
    if(this.selectionMode !== this.selectionModes.TRANSFORM 
      || this.transformControls.pointerMissed) {

        if(this.isDrag(event)) {

          if(this.startedMouseDownInGroup) {
            
            this.currentlyDraggingGroup = true;

          } else {
            this.controls.onMouseMove(event);
          }

        }

    }

  }

  dragGroupUpdate() {
    
    const x =   (this.lastMousePosX / this.mainViewport.width)  * 2 - 1;
    const y = - (this.lastMousePosY / this.mainViewport.height) * 2 + 1;

    this.dragRayCaster.setFromCamera( new Vector2(x, y), this.mainViewport.camera );

    let intersect = new Vector3();
    this.dragRayCaster.ray.intersectPlane(this.dragPlane, intersect);

    const direction = intersect.sub(this.groupWeAreDragging.obj.position);

    const lenSq = direction.lengthSq();

    const scale = THREE.Math.clamp(Math.log(lenSq*300.0 + 1)*2.0, 0.0, 20.0);

    this.groupWeAreDragging._rigidBody.applyForce(direction.normalize().multiplyScalar(scale));

  }

  deleteSelection() {

    this.selectedGroups.forEach(group => {
        
      group.destroySelfAndChildren(this.scene);

    });

  }

  cancel() {

    this.removeOldSelection();
    this.setSelectionMode(this.selectionModes.OBJECT)

  }

  deleteAllGroups() {

    this.getGroups().splice(0).forEach(group => group.destroySelfAndChildren(this.scene));
    updateGroups();

  }

  isSingleSelect() {

    return this.selectedGroups.size === 1  && this.firstSelectedGroup().obj.children.length === 1;

  }

  selectConstraint(obj) {

    if(this.selectedConstraintVis) {
      this.makeObjColor(this.selectedConstraintVis, COLORS.CONSTRAINT_COLOR);
    }

    this.makeObjColor(obj, COLORS.SELECTED_COLOR);

    this.selectedConstraintVis = obj;
    this.selectedConstraint = 
      this.physics.constraintVis.getConstraintWrapperFromVisObject(this.selectedConstraintVis);

  }

  rightClick(intersects, event) {

    let ctxMenu = {}

    if(this.selectionMode === this.selectionModes.SELECT_CONSTRAINT  && intersects[0]) {

      const vis = intersects[0].object;
      this.selectConstraint(vis);
      ctxMenu['Delete_Constraint>delete'] = x => {
        this.physics.constraintStore.deleteConstraint(this.selectedConstraint);
        this.setSelectionMode(this.selectionModes.OBJECT);
      };

      ctxMenu["Cancel>cancel"] = x => this.cancel();

    } else if (intersects[0]) {

        const group = groupWrapperFromObject(intersects[0].object);

        if(!this.selectedGroups.has(group)) {

          this.selectGroup(group, false);

        }
        

        if(this.selectionMode === this.selectionModes.OBJECT) {
          
          ctxMenu['Focus>visibility'] = x => this.pushCommand(new FocusCommand(this, {group}));
          if(group.isFixed()) {
            ctxMenu['Unlock>lock_open'] = x => this.pushCommand(new LockGroupCommand(this, {group}));
          } else {
            ctxMenu['Lock>lock'] = x => this.pushCommand(new LockGroupCommand(this, {group}));
          }
  
          if(this.selectedGroups.size > 1) {

            ctxMenu['Group>group_work'] = x => this.groupSelection();

          }

          if(this.selectedGroups.size === 1 && this.firstSelectedGroup().children().length > 1) {
            
              ctxMenu['Un-Group>all_out'] = x => this.groupSelection();
            
          }

          if(this.selectedGroups.size == 1) {

            ctxMenu['Translate>device_hub'] = (x) =>{
              this.pushCommand(new SelectGroupCommand(this, {group}));
              this.pushCommand(new ToggleTransformModeCommand(this));
              this.transformControls.setMode('translate');
            };

            ctxMenu['Rotate>cached'] = (x) =>{
              this.pushCommand(new SelectGroupCommand(this, {group}));
              this.pushCommand(new ToggleTransformModeCommand(this));
              this.transformControls.setMode('rotate');
            };

          
            ctxMenu['Select_Node>fiber_manual_record'] = x => {

              this.setSelectionMode(this.selectionModes.VERTEX);

            }

            ctxMenu['Select_Element>remove'] = x => {
              
              this.setSelectionMode(this.selectionModes.EDGE);

            }

            ctxMenu['Secect_Face>check_box_outline_blank'] = x => {

              this.setSelectionMode(this.selectionModes.FACE);

            }

            ctxMenu["Select_Constraint>link"] = ((x)=>{
              
                        this.setSelectionMode(this.selectionModes.SELECT_CONSTRAINT);
              
            }).bind(this);

          }


          ctxMenu['Delete>delete>1000'] = x => {
            this.deleteSelection();
          }
          
          

        } else {

          ctxMenu["Cancel>cancel"] = x => this.cancel();

        }

        if(this.selectionMode === this.selectionModes.EDGE && this.isSingleSelect()) {

          ctxMenu['Path_Constraint_From_Edge>trending_flat'] = ((x) => {
            
            const currentSelection = this.firstSelectedGroup();
            
            this.PathConstraintFactory.setGroupA(currentSelection, 
              this.selectedEdgeVerts[0].vector,
              this.selectedEdgeVerts[1].vector);

            this.setSelectionMode(this.selectionModes.CREATE_PATH_CONSTRAINT);

          });

        }

        if(this.selectionMode === this.selectionModes.CREATE_PATH_CONSTRAINT && this.isSingleSelect()) {

          ctxMenu['Constrain_To_Path>trending_flat'] = ((x) => {

            const currentSelection = this.firstSelectedGroup();

            this.PathConstraintFactory.setGroupB(currentSelection);

            this.PathConstraintFactory.create();

            this.setSelectionMode(this.selectionModes.OBJECT);

          });
 
        }

        if(this.selectionMode === this.selectionModes.VERTEX && this.isSingleSelect()) {

          ctxMenu['Ball_Joint_Start>timeline'] = ((x) => {

            const currentSeleciton = this.firstSelectedGroup();
            this.BallConstraintFactory.setStart(currentSeleciton, this.VertexSelector.getVertexPositionLocal());

            this.setSelectionMode(this.selectionModes.CREATE_BALL_JOINT);

          }).bind(this);

        } else if(this.selectionMode === this.selectionModes.CREATE_BALL_JOINT && this.isSingleSelect()) {
          
          ctxMenu['Ball_Joint_End>timeline'] = ((x) => {

            const currentSeleciton = this.firstSelectedGroup();
            this.BallConstraintFactory.setEnd(currentSeleciton, this.VertexSelector.getVertexPositionLocal());

            this.BallConstraintFactory.create();

            this.cancel();
            
          }).bind(this);
          
        }

        // if(this.selectionMode === this.selectionModes.OBJECT && this.selectedGroups.size === 2) {

        //   ctxMenu["Offset_Constraint"] = ((x)=>{

        //     const selected = Array.from(this.selectedGroups);

        //     this.OffsetConstraintFactory.setRigidBodyA(selected[0]._rigidBody);
        //     this.OffsetConstraintFactory.setRigidBodyB(selected[1]._rigidBody);

        //     this.OffsetConstraintFactory.create();

        //   }).bind(this);
        // }

        ctxMenu["Properties>list"] = ((x)=>{

          const facade = new GroupMutateFacade();

          const groupToModify = this.firstSelectedGroup();
          
          const config = facade.generateConfig(groupToModify);

          EventBus.$emit('open-mutate-object',{
            config,
            callback: (value)=>{
              facade.applyChanges(groupToModify, value);
            }
          });

        }).bind(this);
        
    } else {
      ctxMenu["Reset_Camera>visibility"] = x => this.cameraSaver.restoreOriginal(this.mainViewport.camera, this.controls);
    }

    EventBus.$emit('open-context-menu', {
      event: event,
      context : ctxMenu
    });

  }


  leftClick (intersects, event) {

    if(this.selectionMode === this.selectionModes.SELECT_CONSTRAINT && intersects[0]) {

      const vis = intersects[0].object;
      this.selectConstraint(vis);

    } else if (intersects[0]) {

      const obj = intersects[0].object;

      switch(this.selectionMode) {

        case(this.selectionModes.TRANSFORM):
          this.selectGroupForTransform(groupWrapperFromObject(obj));
        break;

        // Face selection
        case(this.selectionModes.FACE):
          this.removeOldSelection();
          this.selectObject(obj, false);
          var faceTools = this.__ensureFaceTools(obj.geometry);

          faceTools.onCoplanar = function(rfaces){
            for(var i in rfaces){
              rfaces[i].color.setHex(0xff0000);
            }
          }

          faceTools.getCoplanar(13, obj.geometry, intersects[0].face);
          obj.geometry.colorsNeedUpdate=true;
        break;
        
        // Object selection
        case(this.selectionModes.OBJECT):
          this.selectObject(obj, event.ctrlKey);
        break;

        case(this.selectionModes.CREATE_PATH_CONSTRAINT):
          this.selectObject(obj, false);
        break
          
        // Vertex selection
        case(this.selectionModes.VERTEX):
          this.VertexSelector.select(intersects);
        break;

        case(this.selectionModes.CREATE_BALL_JOINT):
          this.VertexSelector.select(intersects);
        break;
        
        // Edge selection
        case(this.selectionModes.EDGE):
          this.removeOldSelection();
          this.selectObject(obj, false);        
          var faceTools = this.__ensureFaceTools(obj.geometry);
          //const nearestEdge = faceTools.getNearestEdge(obj.geometry, intersects[0].face, intersects[0].point, obj.matrixWorld);
          const nearestEdge = faceTools.getNearestEdgeLocal(obj.geometry, intersects[0].face, intersects[0].point, obj.matrixWorld);
          this.moveSelectionCylinder(nearestEdge[0].vector.clone().applyMatrix4(obj.matrixWorld),
                                     nearestEdge[1].vector.clone().applyMatrix4(obj.matrixWorld));

          this.selectedEdgeVerts = nearestEdge;
          this.selectedEdgeOwner = obj;
        break;
      }

    } else {
      this.removeOldSelection();
      if(this.selectionMode === this.selectionModes.TRANSFORM) {
        this.setSelectionMode(this.selectionModes.OBJECT);
      }
    }
    return intersects
  }

}
