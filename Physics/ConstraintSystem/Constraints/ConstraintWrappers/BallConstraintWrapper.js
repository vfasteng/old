import * as THREE from 'three';
import { ConstraintWrapperBase } from './ConstraintWrapperBase';
import { BallConstraintVisualisation } from '../ConstraintVisualisations/BallConstraintVisualisation'
import { BallConstraint } from '../BallConstraint';
import { groupWrapperFromId } from '../../../../Group';
import { serializeVector, deserializeVector } from '../../../../SerializationUtils';

export class BallConstraintWrapper extends ConstraintWrapperBase {

    initLive(groupA, groupB, pointA, pointB) {
        
        this._groupA = groupA;
        this._groupB = groupB;
        this._pointA = pointA;
        this._pointB = pointB;
        this.$type = "BallConstraint"

        const constraint = new BallConstraint(
            this._world,
            this._groupA._rigidBody,
            this._groupB._rigidBody,
            this._pointA,
            this._pointB
        );

        this.constraint = constraint;

        this.visualisation = new BallConstraintVisualisation();

        this._world.constraintVis.addVis(this, this.visualisation);
    }

    updateVis() {

        this.visualisation.update(this.constraint);

    }

}