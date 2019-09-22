import { GroupWrapper } from '../Group';

class MutateFacade {

    constructor() {}

    generateConfig(object) {
        logErr("Not implimented");
    }

    applyChanges(object, returnedValues) {
        
    }

}


export class GroupMutateFacade extends MutateFacade {


    /**
     * @param  {GroupWrapper} group
     */
    generateConfig(group) {

        return {
            name: group.name,
            props: [
                {
                    type: "string",
                    name: "name",
                    displayName: "Name",
                    value: group.name
                },
                {
                    type: "string",
                    name: "collisionGroup",
                    displayName: "Collision Group",
                    value: group.collisionGroup
                },
                {
                    type: "multi-select",
                    name: "collidesWith",
                    displayName: "Collides With",
                    selected: group.collidesWith,
                    // options: [
                    //     {
                    //         displayName: "Numero Uno",
                    //         value: "1"
                    //     },
                    //     {
                    //         displayName: "Numero Dos",
                    //         value: "2"
                    //     }

                    // ]

                }
            ]
        } 
        
    }

    
    /**
     * @param  {GroupWrapper} group
     * @param  {Object} returnedValues
     */
    applyChanges(group, returnedValues) {

        group.setName(returnedValues.name);
        group.setCollisionGroup(returnedValues.collisionGroup);
        group.setCollidesWith(returnedValues.collidesWith);
        
        group.disablePhysics();
        group.enablePhysics();

    }


}