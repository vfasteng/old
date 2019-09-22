import AmmoManagedClass from './AmmoManagedClass';
const _  = require('../JSUtils');

import * as THREE from 'three';

import { PhysicsWorld } from './Physics';
import { createCompoundShape } from './ShapeFactory';

const SHAPES = {
    BOX: 0,
    MESH: 1
};
export {SHAPES};

const ACTIVATION_STATE = {
    ACTIVE: 1,
    ISLAND_SLEEPING: 2,
    WANTS_DEACTIVATION: 3,
    DISABLE_DEACTIVATION: 4,
    DISABLE_SIMULATION: 5
};

var RigidBodyIdCount = 0;

export class RigidBody extends AmmoManagedClass {

    
    /**
     * @param  {PhysicsWorld} physicsWorld
     * @param  {Object} options
     */
    constructor(physicsWorld, options) {
        
        super();

        this.id = RigidBodyIdCount++;

        this._world = physicsWorld;

        this._sleeping = false;

        const defualtConfig = {
            mass: 1,
            __name: 'RigidBody'
        }

        this._options = _.defaults(options, defualtConfig , ['position', 'rotation', 'shape']);

        this._fixed = this._options.fixed;
        this._mass = this._options.mass;

        this._lastPos = this._options.position;
        this._lastQuat = this._options.rotation;
        this._lastWorldMatrix = new THREE.Matrix4().identity();        

        this._addBody();

        this.destroyLater('_body');
        this.destroyLater('_info');
        this.destroyLater('_motionState');
    }

    _constructBody() {

        // We don't own the shape.
        const shape = this._options.shape;

        const bodyMass = this._fixed ? 0.0 : this._mass

        const pos = AMM.freshVector();
        const quat = AMM.freshQuat();
        const trans = AMM.freshTransform();
             
        const zeroVector = AMM.freshVector();

        pos.setValue(this._options.position.x, 
            this._options.position.y,
            this._options.position.z);

        quat.setX(this._options.rotation.x);
		quat.setY(this._options.rotation.y);
		quat.setZ(this._options.rotation.z);
        quat.setW(this._options.rotation.w);
        
        trans.setOrigin(pos);
        trans.setRotation(quat);


     
        this._motionState = new Ammo.btDefaultMotionState(trans);

        this._info = new Ammo.btRigidBodyConstructionInfo(bodyMass, this._motionState, 
            shape, zeroVector);
        
        this._info.set_m_friction(0.5);
        this._info.set_m_restitution(0.35);
        
        this._body = new Ammo.btRigidBody(this._info);

        this._body.setCollisionFlags(0);

        this._body.setLinearVelocity(zeroVector);
        this._body.setAngularVelocity(zeroVector);

        // Stop bullet from putting the RB to sleep until another object collides with it.
        // If we don't do this we get objects hanging in mid air etc.
        this._body.setActivationState(ACTIVATION_STATE.DISABLE_DEACTIVATION);

        if(this._options.isCompound) {
            
            shape.calculateLocalInertia(bodyMass, zeroVector);
            
            this._body.setMassProps(bodyMass, zeroVector);
            this._body.updateInertiaTensor();

        } else  {

            shape.calculateLocalInertia(bodyMass, zeroVector);    

        }

        AMM.returnTransforms(1);
        AMM.returnQuats(1);
        AMM.returnVectors(2);
    }    

    _addBody() {

        this._constructBody();

        const collisionMapper = this._world.collisionGroupMapper;

        let collisonGroup = 1;
        let collisionMask = 1;

        if(this._options.collisionGroup) {

            if(!collisionMapper.groupExists(this._options.collisionGroup)) {
                collisionMapper.addGroup(this._options.collisionGroup);
            }

            collisonGroup = collisionMapper.getGroup(this._options.collisionGroup);

        }

        if(this._options.collidesWith) {

            collisionMask = collisionMapper.getMask(this._options.collidesWith);

        }

        if(this._options.collidesWithAll) {

            collisionMask = collisionMapper.getTotalMask();

        }

        this._world.getAmmoWorld().addRigidBody(this._body, collisonGroup, collisionMask);
        this.needsConstraintUpdate = true;
    }

    sleep() {

        if(!this._sleeping) {
            this._sleeping = true;
            this.destroyAmmo();
        }

    }

    becomeFixed() {

        if(!this._sleeping) {

            this.sleep();
        }

        this._fixed = true;

        this.wake(this._lastPos, this._lastQuat);

    }

    becomeDynamic() {
        
        if(!this._sleeping) {

            this.sleep();
        }

        this._fixed = false;

        this.wake(this._lastPos, this._lastQuat);
    
    }

    getMass() {

        return this._mass;

    }

    isFixed() {
        
        return this._fixed;

    }

    isAsleep() {
        
        return this._sleeping;

    }

    setCollisionGroup(val) {
        
        this._options.collisionGroup = val;

    }

    setColidesWith(val) {

        this._options.collidesWith = val;

    }

    applyForce(vector) {

        if(!this._sleeping && !this._fixed) {

            const ammoVector = AMM.freshVectorFromThree(vector);
            this._body.applyCentralForce(ammoVector);
            AMM.returnVectors(1);

        }
        
    }

    wake(position, rotation) {

        if(position) {
            this._options.position = position;
        }
        
        if(rotation) {
            this._options.rotation = rotation;
        }

        if(this._sleeping) {
            this._sleeping = false;
            this._addBody();
        }

    }

    syncObject(obj) {

        const motionState = this._body.getMotionState();
        const trans = AMM.freshTransform();
        motionState.getWorldTransform(trans);

        const pos = trans.getOrigin();
        const rot = trans.getRotation();
        
        obj.quaternion.x = rot.x();
        obj.quaternion.y = rot.y();
        obj.quaternion.z = rot.z();
        obj.quaternion.w = rot.w();

        obj.position.set(pos.x(), pos.y(), pos.z());

        this._lastPos = obj.position;
        this._lastQuat = obj.quaternion;
        this._lastWorldMatrix = obj.matrixWorld;

        AMM.returnTransforms(1);
    }
    
    destroyAmmo() {

        if(this._world) {
            const ammoWorld = this._world.getAmmoWorld();
            if(ammoWorld) {
                ammoWorld.removeRigidBody(this._body);
            }
        }

        this.destroyAll();
    }
    
    destroy() {

        this._world.constraintStore.deleteAtachedConstraints(this);
        this.destroyAmmo();
        
    }

}