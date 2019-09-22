import * as _ from '../JSUtils';


const MASK_LENGTH = 15;
// Bullet uses a short to represent the collision mask.
// This means 16 bits => 15 groups.
// 100000000000000
// 010000000000000
// 001000000000000
// etc.
const BIT_MASKS = [...Array(MASK_LENGTH).keys()].map(x => 1 << x);

export class CollisionGroupMapper {

    constructor() {

        this.nameMap = {};
        this.count = 0;

        this.addGroup("default");
    }

    addGroup(groupName) {

        if(this.nameMap[groupName]) {
            logErr(`Group ${groupName} already exists`);
        }

        if(this.count + 1 > BIT_MASKS.length) {
            logErr("Max number of groups exceeded");
        }

        this.nameMap[groupName] = BIT_MASKS[this.count++];

        return this.nameMap[groupName];

    }

    getGroup(groupName) {

        if(!this.nameMap[groupName]) {
            logErr(`Group ${groupName} does not exist`);
        }

        return this.nameMap[groupName];
    }

    getMask(groupNames) {

        let accum = 0;

        for(let i = 0; i < groupNames.length; i++) {

            if(this.groupExists(groupNames[i])) {

                accum |= this.getGroup(groupNames[i]);

            } else {

                console.warn(`Group ${groupNames[i]} does not exist`)

            }

        }

        return accum;

    }


    getTotalMask() {

        return (1 << MASK_LENGTH) - 1;
    }

    groupExists(groupName) {

        return !!this.nameMap[groupName];

    }
}