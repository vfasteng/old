import { ConstraintWrapperBase } from './Constraints/ConstraintWrappers/ConstraintWrapperBase';
import { ConstraintVisualisationBase } from './Constraints/ConstraintVisualisations/ConstraintVisualisationBase'
import * as THREE from 'three';

export class ConstraintVisualHerder {

    constructor() {

        this._visualisations = [];
        this._toPutInScene = [];
        this._toRemoveFromScene = [];
        this._constraintVisMap = {};
        this._visObjectConstraintMap = {};

    }

    /**
     * @param  {ConstraintWrapperBase} constraint
     * @param  {ConstraintVisualisationBase} vis
     */
    addVis(constraint, vis) {

        this._visualisations.push(vis);
        this._constraintVisMap[constraint.id] = vis;
        this._visObjectConstraintMap[vis.getThreeObject().id] = constraint;
        this._toPutInScene.push(vis);
        
    }

    
    /**
     * @param {THREE.Object3D} object
     * @returns {ConstraintWrapperBase} constraint
     */
    getConstraintWrapperFromVisObject(object) {

        return this._visObjectConstraintMap[object.id];

    }

    
    /**
     * @param  {ConstraintWrapperBase} constraint
     */
    onConstraintDestroy(constraint) {

        const vis = this._constraintVisMap[constraint.id]
        this._constraintVisMap[constraint.id] = undefined;
        this._visObjectConstraintMap[vis.getThreeObject().id] = undefined

        const i = this._visualisations.indexOf(vis);
        this._visualisations.splice(i, 1);
        
        this._toRemoveFromScene.push(vis);
        
    }

    /**
     * @returns {Array<THREE.Object3D>}
     */
    getVisualisationsForRaycast() {

        return this._visualisations.map(v => v.getThreeObject());

    }

    
    /**
     * @param  {THREE.Scene} scene
     */
    updateScene(scene) {

        this._toPutInScene.forEach(vis => {
            scene.add(vis.getThreeObject());
        });

        this._toPutInScene = [];
        
        this._toRemoveFromScene.forEach(vis => {
            scene.remove(vis.getThreeObject());
        });

        this._toRemoveFromScene = [];
    }

    

}