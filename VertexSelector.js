import * as THREE from 'three';

export default class VertexSelector {

    constructor(world) {
        
        this._world = world;

        var sphereGeometry = new THREE.SphereGeometry( 0.05, 32, 32 );
        var sphereMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        this.selectionSphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
        this.selectionSphere.name = "Selection Sphere";

        // We cannot make the selection sphere a child of the object to keep it updated
        // because if we do that it gets scaled with the object.
        // So we keep it in scene/world space and update its position manualy.
        this._world.scene.add(this.selectionSphere);

        this._vertexOwner = undefined;
        this.selectedVertexIndex = 0;

    }


    update() {

        if(this._vertexOwner) {

            this._updatePositionOfSphere();

        }

    }

    _updatePositionOfSphere() {

        const vert = this._vertexOwner.geometry.vertices[this.selectedVertexIndex];
        const worldPos = vert.clone().applyMatrix4(this._vertexOwner.matrixWorld);
        this.selectionSphere.position.copy(worldPos);

    }

    hideSelectionSphere() {

        this.selectionSphere.material.visible = false;
        this.selectionSphere.material.needsUpdate = true;

    }

    showSelectionSphere() {

        this.selectionSphere.material.visible = true;
        this.selectionSphere.material.needsUpdate = true;

    }

    select(intersects) {

        this._vertexOwner = intersects[0].object;
        
        this._world.removeOldSelection();
        this._world.selectObject(this._vertexOwner, false);
        
        var faceTools = this._world.__ensureFaceTools(this._vertexOwner.geometry);
        
        const vertexInfo = faceTools.getNearestVertex(this._vertexOwner.geometry, intersects[0].face, intersects[0].point, this._vertexOwner.matrixWorld);
    
        this.selectedVertexIndex = vertexInfo.index;
        
        this._updatePositionOfSphere();

        this.showSelectionSphere();
        
    }

    getVertexPositionWorld() {

        return this._vertexOwner.geometry.vertices[this.selectedVertexIndex].clone().applyMatrix4(this._vertexOwner.matrixWorld);

    }

    getVertexPositionLocal() {

        return this._vertexOwner.geometry.vertices[this.selectedVertexIndex].clone();

    }



}