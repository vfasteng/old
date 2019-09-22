import * as THREE from 'three';
import { COLORS } from '../../../../Colors';
import { SixDOFConstraint } from '../SixDOFConstraint';
import { ConstraintWrapperBase } from './ConstraintWrapperBase';
import { getPointInBetweenByPerc } from '../../../../GeometryUtils';
import { PathConstraintVisualisation } from '../ConstraintVisualisations/PathConstraintVisualisation';
import { groupWrapperFromId } from '../../../../Group';
import { serializeVector, deserializeVector } from '../../../../SerializationUtils';

export class PathConstraintWrapper extends ConstraintWrapperBase {

    initLive(vertexA, vertexB, groupA, groupB) {

        this._groupA = groupA;
        this._groupB = groupB;
        this.vertexA = vertexA;
        this.vertexB = vertexB;
        this._rigidBodyA = this._groupA._rigidBody;
        this._rigidBodyB = this._groupB._rigidBody;
        this.$type = "PathConstraint";

        const rbAOffset = getPointInBetweenByPerc(this.vertexA, this.vertexB, 0.5);
        
        const edge = this.vertexA.clone().sub(this.vertexB);
        const edgeLen = edge.length()
        const edgeNorm = edge.normalize()

        var axis = new THREE.Vector3(0, 1, 0);
        const rbARotation = new THREE.Quaternion().setFromUnitVectors(axis, edgeNorm);


        const constraint = new SixDOFConstraint(
            this._world, 
            this._rigidBodyA, 
            this._rigidBodyB, 
            rbAOffset,
            new THREE.Vector3(), 
            rbARotation,
            new THREE.Quaternion()
        );

        constraint.setOnlyLinear(true);
        constraint.setLinearLowerLimit(new THREE.Vector3(0,-edgeLen/2,0));
        constraint.setLinearUpperLimit(new THREE.Vector3(0,edgeLen/2,0));

        this.constraint = constraint;


        this.visualisation = new PathConstraintVisualisation(edgeLen);
        this._world.constraintVis.addVis(this, this.visualisation);

    }

    updateVis() {

        this.visualisation.update(this.constraint, this.vertexA, this.vertexB);

    }

}