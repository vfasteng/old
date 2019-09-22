export default class CameraSaver {

    constructor() {
        this.original = {};
        this.saved = {};
    }

    saveOriginal(camera, controls) {
        this._save(camera, controls, this.original);
    }

    restoreOriginal(camera, controls) {
        this._restore(camera, controls, this.original);
    }

    save(camera, controls) {
        this._save(camera, controls, this.saved);
    }

    restore(camera, controls) {
        this._restore(camera, controls, this.saved)
    }

    _save(camera, controls, object) {
        
        object.position = camera.position.clone();
        object.rotation = camera.rotation.clone();
        object.controlCenter = controls.center;

    }

    _restore(camera, controls, object) {
        
        camera.position.set(object.position.x, object.position.y, object.position.z);
        camera.rotation.set(object.rotation.x, object.rotation.y, object.rotation.z);
        controls.setCenter(object.controlCenter);

    }




}