export class ConstraintStore {

    constructor() {

        this._rigidBodyMap = {};
        this._constraints = [];

    }

    getConstraints() {

        return this._constraints;

    }

    addConstraint(constraint) {

        const bodies = constraint.getInvolvedBodies();

        bodies.forEach(body => {

            if(this._rigidBodyMap[body.id]) {

                this._rigidBodyMap[body.id].push(constraint);
                return;

            }

            this._rigidBodyMap[body.id] = [constraint];
            
        });

        this._constraints.push(constraint);

    }

    update() {

        let allBodies = [];

        for(let i = 0; i < this._constraints.length; i++) {

            let constraintNeedsUpdate = false;
            const bodies = this._constraints[i].getInvolvedBodies();

            allBodies = allBodies.concat(bodies);

            // If any body needs the constraint updating then we will update it.
            for(let j = 0; j < bodies.length; j++) {

                if(bodies[j].needsConstraintUpdate) {
                
                    constraintNeedsUpdate = true;
                    break;

                }

            }

            if(constraintNeedsUpdate || !this._constraints[i].isInitialised()) {

                this._constraints[i].update();

            }

            this._constraints[i].updateVis();

        }

        for(let i = 0; i < allBodies.length; i++) {
            
            allBodies[i].needsConstraintUpdate = false;

        }

    }

    deleteAtachedConstraints(rigidBody) {

        if(this._rigidBodyMap[rigidBody.id]) {

            // Shallow clone the array because we will be modifying it in deleteConstraint.
            const constraints = this._rigidBodyMap[rigidBody.id].slice(0);
        
            constraints.forEach(constraint => {

                this.deleteConstraint(constraint);

            });

        }

    }


    deleteConstraint(constraint) {

        // Remove the constraint from the list of constraints asociated with a body.
        constraint.getInvolvedBodies().forEach(body => {

            const j = this._rigidBodyMap[body.id].indexOf(constraint);
            this._rigidBodyMap[body.id].splice(j, 1);

        });

        // Destriy the constraint and remove it from our list of constraints.
        constraint.destroy();
        const i = this._constraints.indexOf(constraint);
        this._constraints.splice(i, 1);

    }

}