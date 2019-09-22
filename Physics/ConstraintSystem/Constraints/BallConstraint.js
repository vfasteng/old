import { getPointInBetweenByPerc } from '../../../GeometryUtils';
import { RigidBody } from '../../RigidBody';
import { PhysicsWorld } from '../../Physics'
import * as THREE from 'three';
import { ConstraintBase } from './ConstraintBase';

export class BallConstraint extends ConstraintBase {

    /**
     * @param  {PhysicsWorld} physicsWorld - The world this ball constraint will be a part of.
     * @param  {RigidBody} rigidBodyA - The rigidbody on one side of the ball joint,
     * @param  {RigidBody} rigidBodyB - The rigidbody on the other side of the ball joint.
     * @param  {THREE.Vector3} pointA - The point on rigidBodyA in its local space to join.
     * @param  {THREE.Vector3} pointB - The point on rigidBodyB in its local space to join.
     */
    constructor(physicsWorld, rigidBodyA, rigidBodyB, pointA, pointB) {

        super(physicsWorld);
        
        this._world = physicsWorld;


        this._rigidBodyA = rigidBodyA;
        this._rigidBodyB = rigidBodyB;
        this._pointA = pointA;
        this._pointB = pointB;

        this.initialised = false;


    }
    
    update() {

        this.reset();
        this.constructConstraint();
        //this._constraint.enableFeedback();
        this._world.getAmmoWorld().addConstraint(this._constraint);
        this.initialised = true;

    }

    getInvolvedBodies() {

        return [this._rigidBodyA, this._rigidBodyB];

    }

    constructConstraint() {

        console.log('Constructing Constraint');
        const v1 = AMM.freshVectorFromThree(this._pointA);
        const v2 = AMM.freshVectorFromThree(this._pointB);

        this._constraint = new Ammo.btPoint2PointConstraint(
            this._rigidBodyA._body,
            this._rigidBodyB._body,
            v1,
            v2
        );

        AMM.returnVectors(2);

    }

}