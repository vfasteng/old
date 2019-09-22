export default class AmmoManagedClass {

    constructor() {
        this._toDestroy = [];
        this._nonPropertyItems = [];
    }

    destroyLater(prop) {
        this._toDestroy.push(prop)
    }

    destroyAll() {

        for(let i = 0; i < this._toDestroy.length; i++) {
            
            if(this[this._toDestroy[i]]) {
                
                Ammo.destroy(this[this._toDestroy[i]]);
                this[this._toDestroy[i]] = undefined;

            }

        }

        this._toDestroy = [];

    }

    // Overide this.
    destroyAmmo() {

        this.destroyAll();

    }

}