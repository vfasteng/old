class WorldCommand {
    
    constructor(world, options) {

        this._world = world;

        this._options = options;

    }

    execute() {

    }

}

export class ToggleTransformModeCommand extends WorldCommand {

    execute() {

        const w = this._world;
        
        if(w.selectionMode == w.selectionModes.TRANSFORM) {
            w.setSelectionMode(w.selectionModes.OBJECT);
        }
        else {
            w.setSelectionMode(w.selectionModes.TRANSFORM);
        }

    }
}

export class GroupCommand extends WorldCommand {

    execute() {

        this._world.group(this._options.groups);

    }
}

export class LockGroupCommand extends WorldCommand {

    execute() {

        const w = this._world;

        this._options.group.toggleBodyFixed();

        
        if(w.selectionMode === w.selectionModes.TRANSFORM) {
            w.setSelectionMode(w.selectionModes.OBJECT);
        }

    }

}

export class FocusCommand extends WorldCommand  {

    execute() {

        const w = this._world;

        if(this._options.group) {

          w.controls.focus(this._options.group.obj);

        }

    }
}

export class SelectGroupCommand extends WorldCommand {

    execute() {

        const w = this._world;

        w.selectGroup(this._options.group, false);

    }

}