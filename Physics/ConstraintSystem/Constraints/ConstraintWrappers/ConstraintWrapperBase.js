import { PhysicsWorld } from '../../../Physics';

let constraintWrapperIDCount = 1;

export class ConstraintWrapperBase {
    
    /**
     * @param  {PhysicsWorld} physicsWorld
     */
    constructor(physicsWorld) {

        this._world = physicsWorld;
        this.id = constraintWrapperIDCount++;

    }

    updateVis() {

        logErr("Not implimented");

    }

    update() {

        this.constraint.update();

    }


    getInvolvedBodies() {

        return this.constraint.getInvolvedBodies();

    }

    isInitialised() {

        return this.constraint.initialised;

    }

    destroy() {
        
        this.constraint.destroy();
        this._world.constraintVis.onConstraintDestroy(this.constraint);

    }

    serialize() {

        logErr("Depricated method, Moved to Factory");

    }
    
    deserialize(data) {

        logErr("Depricated method, Moved to Factory");

    }

    

}