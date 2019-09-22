
import * as THREE from 'three';
import { COLORS } from '../../../../Colors';
import { getPointInBetweenByPerc } from '../../../../GeometryUtils'
import { ConstraintVisualisationBase } from './ConstraintVisualisationBase';

export class PathConstraintVisualisation extends ConstraintVisualisationBase {

    constructor(edgeLength) {

        super();
        var cylinderGeometry = new THREE.CylinderGeometry( 0.03, 0.03, edgeLength, 8 );
        var cylindermaterial = new THREE.MeshBasicMaterial( {color: COLORS.CONSTRAINT_COLOR, wireframe: true} );
        cylindermaterial.vertexColors = THREE.FaceColors;
        this.visObj = new THREE.Mesh( cylinderGeometry, cylindermaterial );

    }

    update(constraint, vert1, vert2) {

        const start = vert1.clone().applyMatrix4(constraint._rigidBodyA._lastWorldMatrix);
        const end = vert2.clone().applyMatrix4(constraint._rigidBodyA._lastWorldMatrix);
    
        const norm = start.clone().sub(end).normalize();
        
        this.visObj.position.copy(getPointInBetweenByPerc(start, end, 0.5));
        const axis = new THREE.Vector3(0, 1, 0);
        this.visObj.quaternion.setFromUnitVectors(axis, norm);

    }
    
}
