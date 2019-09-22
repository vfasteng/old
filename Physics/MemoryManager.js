class ObjectBuffer {

    constructor(config) {
        
        this._name = config.name;
        this._makeNew = config.makeNew;
        this._destroy = config.destroy;
        this._reset = config.reset;
        this._size = config.size;
        
        
        this._buffer = [];
        this._counter = 0;

        for(var i = 0; i < this._size; i++) {
            this._buffer.push(this._makeNew());
        }

    }

    getObj() {

        if(this._counter + 1 >= this._size) {
            throw new Error(`${this._name} Buffer Overflow`);
        }

        const val = this._buffer[this._counter++];
        this._reset(val);
        return val;
    }

    // Value not reset, could be anything. AKA Dirty.
    getDirtyObj() {
        
        if(this._counter + 1 >= this._size) {
            throw new Error(`${this._name} Buffer Overflow`);
        }

        const val = this._buffer[this._counter++];
        
        return val;

    }

    returnObjs(numberReturned) {
        if(this._counter - numberReturned < 0) {
            logErr(`${this._name} Buffer had more items returned than taken out!`)
        }
        this._counter -= numberReturned;
    }

    destroy() {

        for(var i = 0; i < this._size; i++) {
            // Destroy them in reverse order.
            // Effiecient for Ammo.
            this._destroy(this._buffer[this._size - i]);
        }

    }
}

export class MemoryManager {

    constructor() {

        this.vectorBuffer = new ObjectBuffer({
            name: 'Vector',
            makeNew: x => new Ammo.btVector3(0, 0, 0),
            destroy: v => Ammo.destroy(v),
            reset: v => v.setValue(0, 0, 0),
            size: 10
        });

        this.transformBuffer = new ObjectBuffer({
            name: 'Transform',
            makeNew: x => new Ammo.btTransform(),
            destroy: t => Ammo.destroy(t),
            reset: t => t.setIdentity(),
            size: 10
        });

        this.quatBuffer = new ObjectBuffer({
            name: 'Quaternion',
            makeNew: x => new Ammo.btQuaternion(0, 0, 0, 0),
            destroy: q => Ammo.destroy(q),
            reset: q => q.setValue(1,0,0,0),
            size: 10
        });
    }


    /**
     * @returns {Ammo.btVector3} 
     */
    freshVector() {
        return this.vectorBuffer.getObj();
    }

    /**
     * @returns {Ammo.btVector3} 
     */
    freshVectorFromThree(threeVector) {
        const v = this.vectorBuffer.getDirtyObj();
        v.setValue(threeVector.x, threeVector.y, threeVector.z);
        return v;
    }

    copyVector(threeVector, bulletVector) {
        bulletVector.setValue(threeVector.x, threeVector.y, threeVector.z);
    }

    returnVectors(numberReturned) {
        this.vectorBuffer.returnObjs(numberReturned);
    }

    
    /**
     * @returns {Ammo.btTransform} 
     */
    freshTransform() {
        return this.transformBuffer.getObj();
    }

    returnTransforms(numberReturned) {
        this.transformBuffer.returnObjs(numberReturned);
    }


    /**
     * @returns {Ammo.btQuaternion} 
     */
    freshQuat() {
        return this.quatBuffer.getObj();
    }

    copyQuat(threeQuat, bulletQuat) {
        bulletQuat.setX(threeQuat.x);
		bulletQuat.setY(threeQuat.y);
		bulletQuat.setZ(threeQuat.z);
        bulletQuat.setW(threeQuat.w);
    }

    returnQuats(numberReturned) {
        this.quatBuffer.returnObjs(numberReturned);
    }

    destroy() {
        this.vectorBuffer.destroy();
        this.transformBuffer.destroy();
        this.quatBuffer.destroy();
    }

}

export function initAmmoMemoryManager() {
    const memoryManager = new MemoryManager();
    // @ts-ignore
    window.AMM = new MemoryManager();
    return memoryManager;
}

export function destroyAmmoMemoryManager() {
    // @ts-ignore
    window.AMM.destroy();
    // @ts-ignore
    window.AMM = undefined;
}