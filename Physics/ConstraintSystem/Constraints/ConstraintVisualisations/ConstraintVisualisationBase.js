import * as THREE from 'three';
import { COLORS } from '../../../../Colors';
import { getPointInBetweenByPerc } from '../../../../GeometryUtils'

let visualisationIDCount = 1;

export class ConstraintVisualisationBase {

    constructor() {

        this.id = visualisationIDCount++;

    }

    getThreeObject() {

        return this.visObj;
        
    }


}