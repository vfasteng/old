import * as THREE from 'three';

import { MemoryManager, initAmmoMemoryManager, destroyAmmoMemoryManager } from './MemoryManager'
import { RigidBody, SHAPES } from './RigidBody';
import { ConstraintStore }  from './ConstraintSystem/ConstraintStore'
import fs from 'fs'
import path from 'path'
import { CollisionGroupMapper } from './CollisionGroupMapper';
import { ConstraintVisualHerder } from './ConstraintSystem/ConstraintVisualHerder';

// @ts-ignore
var Ammo = require('ammo.js');

export class PhysicsWorld {
  
  constructor() {

    // @ts-ignore
    window.Ammo = Ammo;
    // @ts-ignore
    window.PhysicsWorld = this;

    this._memoryManager = initAmmoMemoryManager();

    this._broadphase = new Ammo.btDbvtBroadphase();

    this._collisionConfig = new Ammo.btDefaultCollisionConfiguration();
    this._dispatcher = new Ammo.btCollisionDispatcher(this._collisionConfig);

    this._solver = new Ammo.btSequentialImpulseConstraintSolver;

    this._world = new Ammo.btDiscreteDynamicsWorld(this._dispatcher,
      this._broadphase,
      this._solver,
      this._collisionConfig);

    this._world.setGravity(new Ammo.btVector3(0,-9.810,0));

    var dInfo = this._world.getDispatchInfo();
    
    dInfo.set_m_allowedCcdPenetration(0.001);

    this.constraintStore = new ConstraintStore();
    this.collisionGroupMapper = new CollisionGroupMapper();
    this.constraintVis = new ConstraintVisualHerder();

  }

  MM() {
    return this._memoryManager;
  }

  destroy() {

    Ammo.destroy(this._world);
    Ammo.destroy(this._solver);
    Ammo.destroy(this._dispatcher);
    Ammo.destroy(this._collisionConfig);
    Ammo.destroy(this._broadphase);

    destroyAmmoMemoryManager();
    this._memoryManager = undefined;

  }

  tick(framerate) {

    this.constraintStore.update();
    this._world.stepSimulation(1.0/framerate, 10);

  }

  
  /**
   * @returns {Ammo.btDiscreteDynamicsWorld}
   */
  getAmmoWorld() {
    return this._world;
  }


}