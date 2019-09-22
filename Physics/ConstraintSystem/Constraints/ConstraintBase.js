import { PhysicsWorld } from '../../Physics';

let constraintIdCount = 1;

export class ConstraintBase {

    /**
     * @param  {PhysicsWorld} physicsWorld
     */
    constructor(physicsWorld) {

        this._world = physicsWorld;
        this.id = constraintIdCount++;
        this._updateVis = undefined;

    }

    update() {

        logErr("Not implimented");

    }

    getInvolvedBodies() {

        logErr("Not implimented");

    }

    draw() {

        logErr("Depricated method, draw on ConstraintWrapper ");

    }

    updateVis() {

        logErr("Depricated method, draw on ConstraintWrapper ");

    }

    reset() {

        if(this._constraint) {
            
            this._world.getAmmoWorld().removeConstraint(this._constraint);
            Ammo.destroy(this._constraint);
            this._constraint = undefined;

        }

    }

    destroy() {

        this.reset();

    }

    setUpdateVis(val) {

        this._updateVis = val;

    }

}