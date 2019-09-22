import { PhysicsWorld } from '../../Physics'
import { RigidBody } from '../../RigidBody';
import * as THREE from 'three';
import { ConstraintBase } from './ConstraintBase';

export class SixDOFConstraint extends ConstraintBase{

    /**
     * @param  {PhysicsWorld} physicsWorld
     * @param  {RigidBody} rigidBodyA
     * @param  {RigidBody} rigidBodyB
     * @param  {THREE.Vector3} offsetA
     * @param  {THREE.Vector3} offsetB
     * @param  {THREE.Quaternion} rotA
     * @param  {THREE.Quaternion} rotB
     */
    constructor(physicsWorld, rigidBodyA, rigidBodyB, offsetA, offsetB, rotA, rotB) {

        super(physicsWorld);

        this._rigidBodyA = rigidBodyA;
        this._rigidBodyB = rigidBodyB;

        this._offsetA = offsetA;
        this._offsetB = offsetB;

        this._rotA = rotA;
        this._rotB = rotB;

        this._linearLowerLimit = new THREE.Vector3();
        this._linearUpperLimit = new THREE.Vector3();
        this._angularLowerLimit = new THREE.Vector3();
        this._angularUpperLimit = new THREE.Vector3();

        this._onlyLinear = false;
        this._onlyAngular = false;

        this.initialised = false;

    }

    setLinearLowerLimit(linearLower) {

        this._linearLowerLimit = linearLower;

    }

    setLinearUpperLimit(linearUpper) {

        this._linearUpperLimit = linearUpper; 

    }

    setAngularLowerLimit(angularLower) {

        this._angularLowerLimit = angularLower;

    }

    setAngularUpperLimit(angularUpper) {

        this._angularUpperLimit = angularUpper;

    }

    setOnlyAngular(val) {

        this._onlyAngular = val;

    }

    setOnlyLinear(val) {

        this._onlyLinear = val;

    }

    update() {
        
        this.reset();
        this.constructConstraint();
        this._world.getAmmoWorld().addConstraint(this._constraint);
        this.initialised = true;
    }

    getInvolvedBodies() {
        
        return  [this._rigidBodyA, this._rigidBodyB];
    }

    constructConstraint() {

        const transA = this._world.MM().freshTransform();
        const transB = this._world.MM().freshTransform();
        
        const offsetA = this._world.MM().freshVector();
        const offsetB = this._world.MM().freshVector();

        const rotA = this._world.MM().freshQuat();
        const rotB = this._world.MM().freshQuat();


        this._world.MM().copyVector(this._offsetA, offsetA);
        this._world.MM().copyVector(this._offsetB, offsetB);

        this._world.MM().copyQuat(this._rotA, rotA);
        this._world.MM().copyQuat(this._rotB, rotB);

        transA.setOrigin(offsetA);
        transB.setOrigin(offsetB);

        transA.setRotation(rotA);
        transB.setRotation(rotB);


        this._constraint = new Ammo.btGeneric6DofSpring2Constraint(
            this._rigidBodyA._body, 
            this._rigidBodyB._body, 
            transA, 
            transB, 
            false
        );


        if(this._onlyAngular) {
            
            // Lower > Upper => unconstrained
            this._linearLowerLimit = new THREE.Vector3(1);
            this._linearUpperLimit = new THREE.Vector3(0);
        }

        if(this._onlyLinear) {

            // Lower > Upper => unconstrained
            this._angularLowerLimit = new THREE.Vector3(1);
            this._angularUpperLimit = new THREE.Vector3(0);

        }

        
        this._constraint.setLinearLowerLimit(
            this._world.MM().freshVectorFromThree(this._linearLowerLimit));

        this._constraint.setLinearUpperLimit(
            this._world.MM().freshVectorFromThree(this._linearUpperLimit));
        
        this._constraint.setAngularLowerLimit(
            this._world.MM().freshVectorFromThree(this._angularLowerLimit));
    
        this._constraint.setAngularUpperLimit(
            this._world.MM().freshVectorFromThree(this._angularUpperLimit));
        
  
        this._world.MM().returnQuats(2);
        this._world.MM().returnVectors(6);
        this._world.MM().returnTransforms(2);

    }

}