import * as THREE from 'three';
import { COLORS } from '../../../../Colors';
import { getPointInBetweenByPerc } from '../../../../GeometryUtils'
import { ConstraintVisualisationBase } from './ConstraintVisualisationBase';

export class BallConstraintVisualisation extends ConstraintVisualisationBase {

    constructor() {

        super();
        let geomSphere = new THREE.SphereGeometry(0.1, 8, 8);
        let materialSphere = new THREE.MeshBasicMaterial({color: COLORS.CONSTRAINT_COLOR, wireframe: true});
        materialSphere.vertexColors = THREE.FaceColors;
        this.visObj = new THREE.Mesh(geomSphere, materialSphere);
        this.visObj.name = "Ball Constraint Vis";

    }

    update(constraint) {

        const transformA = constraint._rigidBodyA._lastWorldMatrix;
        const transformB = constraint._rigidBodyB._lastWorldMatrix;

        if(transformA && transformB) { 

            const aWorld = constraint._pointA.clone().applyMatrix4( transformA );
            const bWorld = constraint._pointB.clone().applyMatrix4( transformB );

            const jointPos = getPointInBetweenByPerc(aWorld, bWorld, 0.5);

            this.visObj.position.copy(jointPos);

        }

    }

}