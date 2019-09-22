import * as THREE from 'three';
import { GroupWrapper } from '../../Group';
import { RigidBody } from '../RigidBody';
import { PhysicsWorld } from '../Physics';
import { BallConstraint } from './Constraints/BallConstraint';
import { SixDOFConstraint } from './Constraints/SixDOFConstraint';
import { getPointInBetweenByPerc } from '../../GeometryUtils';
import { COLORS } from '../../Colors';
import { PathConstraintWrapper } from './Constraints/ConstraintWrappers/PathConstraintWrapper';
import { BallConstraintWrapper } from './Constraints/ConstraintWrappers/BallConstraintWrapper';
import { serializeVector, deserializeVector } from '../../SerializationUtils';
import { groupWrapperFromId } from '../../Group'

export class BallConstraintFactory {

    
    /**
     * @param  {PhysicsWorld} physicsWorld
     */
    constructor(physicsWorld) {
        
        this._world = physicsWorld;

        this._groupA = undefined;
        this._groupB = undefined;
        this._pointA = undefined;
        this._pointB = undefined;

    }


    setStart(group, localPosition) {
        
        this._groupA = group;
        this._pointA = localPosition;

    }

    setEnd(group, localPosition) {
        
        this._groupB = group;
        this._pointB = localPosition;
        
    }

    create() {

        if(!this._groupA || ! this._groupB || !this._pointA || !this._pointB) {

            logErr("Cannot construct a ball constraint without two objects and two points.");

        }

        if(this._groupA._rigidBody.id === this._groupB._rigidBody.id) {
            
            logErr("Cannot create a ball constraint between points on the same body.");
        }

        const wrapper = new BallConstraintWrapper(this._world);

        this._pointA.multiplyScalar(this._groupA.obj.children[0].userData.scale);
        this._pointB.multiplyScalar(this._groupB.obj.children[0].userData.scale);

        const bToANorm = this._pointA.clone().sub(this._pointB).normalize();
        
        // Margin
        this._pointA.add(bToANorm.clone().multiplyScalar(0.13)),
        this._pointB.sub(bToANorm.clone().multiplyScalar(0.13)),

        wrapper.initLive(this._groupA, this._groupB, this._pointA, this._pointB)
        
        this._world.constraintStore.addConstraint(wrapper);

        this._groupA = undefined;
        this._groupB = undefined;
        this._pointA = undefined;
        this._pointB = undefined;

    }

    serialize(constraint ) {

        return {
            groupA: constraint._groupA.id,
            groupB: constraint._groupB.id,
            pointA: serializeVector(constraint._pointA),
            pointB: serializeVector(constraint._pointB),
            $type: "BallConstraint"
        };

    }

    deserialize(data) {

        const groupA = groupWrapperFromId(data.groupA);
        const groupB = groupWrapperFromId(data.groupB);

        const pointA = deserializeVector(data.pointA);
        const pointB = deserializeVector(data.pointB);

        const wrapper = new BallConstraintWrapper(this._world);
        wrapper.initLive(groupA, groupB, pointA ,pointB)

        this._world.constraintStore.addConstraint(wrapper);


    }

}

export class OffsetConstraintFactory {

    // STUB
}

export class PathConstraintFactory {

    constructor(physicsWorld) {

        this._world = physicsWorld;


        this._rigidBodyA = undefined;
        this._vertexA1 = undefined;
        this._vertexA2 = undefined;

        this._rigidBodyB = undefined;

    }

    
    /**
     * @param  {GroupWrapper} val - The rigidbody to slide on
     * @param  {THREE.Vector3} v1 - First vertex of the edge in local space
     * @param  {THREE.Vector3} v2 - Second vertex of the edge in local space
     */
    setGroupA(val, v1, v2) {

        this._groupA = val;
        this._vertexA1 = v1;
        this._vertexA2 = v2;

    }

    
    /**
     * @param  {GroupWrapper} val - The sliding rigidbody
     */
    setGroupB(val) {

        this._groupB = val;

    }

    create() {

        if(!this._groupA._rigidBody|| !this._groupB._rigidBody || !this._vertexA1 || !this._vertexA2) {
            logErr("Cannot construct a path without the requisite two rigidbodies and edge verticies");
        }

        if(this._groupA._rigidBody.id === this._groupB._rigidBody.id) {
            logErr("Cannot construct a path between a rigidbody and itself.")
        }

     
        const wrapper = new PathConstraintWrapper(this._world);

        this._vertexA1.multiplyScalar(this._groupA.obj.children[0].userData.scale);
        this._vertexA2.multiplyScalar(this._groupA.obj.children[0].userData.scale);
            
        wrapper.initLive(this._vertexA1, this._vertexA2, this._groupA, this._groupB);
        
        this._world.constraintStore.addConstraint(wrapper);

        this._groupA = undefined;
        this._groupB = undefined;
        this._vertexA1 = undefined;
        this._vertexA2 = undefined;

    }

    serialize(constraint) {

        return {
            groupA: constraint._groupA.id,
            groupB: constraint._groupB.id,
            vertexA: serializeVector(constraint.vertexA),
            vertexB: serializeVector(constraint.vertexB),
            $type: "PathConstraint"
        };

    }

    deserialize(data) {
        
        const groupA = groupWrapperFromId(data.groupA);
        const groupB = groupWrapperFromId(data.groupB);

        const vertexA = deserializeVector(data.vertexA);
        const vertexB = deserializeVector(data.vertexB);


        const wrapper = new PathConstraintWrapper(this._world);
        wrapper.initLive(vertexA, vertexB, groupA, groupB);
        this._world.constraintStore.addConstraint(wrapper);


    }
}
    