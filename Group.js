import { calculateCentriod } from './GeometryUtils';
import { EventBus } from '../GlobalEventBus';
import { normaliseCenter, scaleMesh, normaliseObject } from './NormaliseMesh';
import { RigidBody } from './Physics/RigidBody';
import * as SF from './Physics/ShapeFactory';
import * as THREE from 'three';
import * as _ from './JSUtils';


let toRemove = [];


let __groupMap = {};
let GroupMap = new Proxy(__groupMap, {
    
    set: (target, key, value) =>  {
        const result = target[key] = value;
        EventBus.$emit('groups-changed');
        return result;
    },

    deleteProperty: (target, key) => {
        const result = delete target[key];
        EventBus.$emit('groups-changed');
        return result;
    }
});


// 0 is Falsy, no 0 ids so we can use Truthy check to see if id exists.
var groupIdCount = 1;

export class GroupWrapper {

    constructor(groupObject) {
        
        this.obj = groupObject;        
        this.id = this.obj.userData.groupId;
        this.name = _.isNullOrWhitespace(this.obj.name) ? `Group ${this.id}` : this.obj.name;
        this.obj.name = this.name;
        this.collisionGroup = "default";
        this.collidesWith = ["default"];
        

        this._rigidBody = null;
        this._dragMode = false;
        this._alive = true;
        this._mass = 1.0;
        this._fixed = false;

        

        // For debug only
        this.__groupMap = GroupMap;
        this.__toRemove = toRemove;

    }

    setName(val) {
        this.name = val;
        this.obj.name = val;
    }

    initPhysics(physicsWorld, importedGeometry = false) {
        
        let height = 0;

        this.obj.children.filter(child => !child.shape).forEach(child => {

            if(importedGeometry) {
                
                // Make the center of the object the center of the verts
                // for accurate center of mass given uniform distribution of
                // mass across verts.
                normaliseCenter(child);
            
                scaleMesh(child.geometry, 0.1);
                
                // Normalise scale.
                let scale = normaliseObject(child, 1.0);

                child.userData.scale = scale;

                // TODO: destroy the trimesh that is also created.
                child.shape = SF.createMeshShape(child.geometry, scale).shape;

                child.scale.set(scale, scale, scale);
            
                child.geometry.computeBoundingSphere();
    
                if(child.position.y + child.geometry.boundingSphere.radius > height) {
    
                    height = child.position.y + child.geometry.boundingSphere.radius;
                    
                }


            } else {
                const scale = child.userData.scale;
                child.shape = SF.createMeshShape(child.geometry, scale).shape;
                child.scale.set(scale, scale, scale)
            }
        
        
        });
        
        if(importedGeometry) {
            
            this.obj.position.set(0, height, 0);

        }


        if(this.obj.children.length > 1) {
            
            const centerOffset = calculateCentriod(this.obj.children.map(c => c.position));
    
            // Move the object to the center of mass of the children.
            this.obj.position.add(centerOffset);
            
            // Keep the world position of the children the same.
            this.eachChild(child => child.position.sub(centerOffset));

        } else if(this.obj.children.length === 1) {

            this.obj.children[0].position.set(0, 0, 0);

        }    
      

        this._shape = SF.createCompoundShape(this.obj.children.map(o => o.shape), 
        this.obj.children);


        this._rigidBody = new RigidBody (physicsWorld, {
            position: this.obj.position,
            rotation: this.obj.quaternion,
            isCompound: true,
            mass: this._mass,
            fixed: this._fixed,
            shape: this._shape,
            collisionGroup: this.collisionGroup,
            colidesWith: this.collidesWith
        });

        this._physicsEnabled = true;

    }

    setCollisionGroup(val) {
        this.collisionGroup = val;
        this._rigidBody.setCollisionGroup(val);
    }

    setCollidesWith(val) {
        this.collidesWith = val;
        this._rigidBody.setColidesWith(val);
    }

    toggleBodyFixed() {
        
        this._fixed = !this._fixed;
        this._ensureFixedState();

    }

    setBodyFixed(value) {

        this._fixed = value;
        this._ensureFixedState();

    }

    _ensureFixedState() {

        if(this._fixed) {
            
            if(this._rigidBody && !this._rigidBody.isFixed()) {
                
                this._rigidBody.becomeFixed();

            }

        } else {

            if(this._rigidBody && this._rigidBody.isFixed()) {
                
                this._rigidBody.becomeDynamic();

            }

        }

    }


    isFixed() {

        return this._fixed;

    }

    _physicsSync() {

        if(this._rigidBody && !this._rigidBody.isAsleep()) {

            this._rigidBody.syncObject(this.obj);

        }

    }

    update() {

        // @ts-ignore
        world.DbgDraw.drawSphere(
            this.obj.position,
            0.1,
            'red');

        
        let debugInfo = "";

        if(this._physicsEnabled && this._rigidBody) {

            if(this._rigidBody.isFixed()) {
                debugInfo = `<div style="color: #FFC200;">LOCKED</div>`;
            } else {
                debugInfo = `<div style="color: #00FF00;">Mass: ${this._rigidBody.getMass()}Kg</div>`;
            }
            

        } else {
            debugInfo = `<div style="color: #FF0000;">Physics Disabled</div>`;
        }

        this.obj.userData.debugInfo = debugInfo;
        
        // @ts-ignore
        world.DbgText.drawObjInfo(this.obj);

        if(this._physicsEnabled) {
            this._physicsSync();
        }

    }

    physicsEnabled() {

        return this._physicsEnabled;

    }

    disablePhysics() {

        this._physicsEnabled = false;
        this._rigidBody.sleep();

    }
    
    enablePhysics() {

        this._rigidBody.wake(this.obj.position, this.obj.quaternion);
        this._physicsEnabled = true;

    }

    giveUpChildren(scene) {

        const detachedChildren = [];

        for(let i = 0; i < this.obj.children.length; i++) {
            detachedChildren.push(this.obj.children[i]);
        }

        for(let i = 0; i < detachedChildren.length; i++) {
            THREE.SceneUtils.detach(detachedChildren[i], this.obj, scene);
        }

        return detachedChildren;

    }

    children() {
        return this.obj.children;
    }

    eachChild(func) {
        this.obj.children.forEach(child => func(child));
    }

    hasChildren() {
        return this.obj.children.length !== 0;
    }

    isAlive() {
        return this._alive;    
    }

    destroy() {

        if(this._rigidBody) {

            this._rigidBody.destroy();
            this._rigidBody = undefined;
            Ammo.destroy(this._shape);
            this._shape = undefined;

        }

        toRemove.push(this.id);
        this._alive = false;

    }

    destroySelfAndChildren(scene) {

        const children = this.giveUpChildren(scene);

        children.forEach(child => {

            child.geometry.dispose();
            child.geometry = undefined;
            scene.remove(child);
            
        })

        this.destroy();

    }

    enterScene(scene) {
        scene.add(this.obj);
    }

    exitScene(scene) {
        scene.remove(this.obj);
    }

}


export function groupUnion(groupWrapperA, groupWrapperB, scene) {

    if(!groupWrapperA.hasChildren()) return groupWrapperB; 
    if(!groupWrapperB.hasChildren()) return groupWrapperA;

    const orphans = groupWrapperA.giveUpChildren(scene)
        .concat(groupWrapperB.giveUpChildren(scene));

    groupWrapperA.exitScene(scene);
    groupWrapperB.exitScene(scene);

    groupWrapperA.destroy();
    groupWrapperB.destroy();

    return makeGroup(orphans, scene);
}


export function decomposeGroup(groupWrapper, scene, physics) {

    const children = groupWrapper.giveUpChildren(scene);

    children.forEach(child => {
        const newGroup = makeGroup([child], scene);
        newGroup.initPhysics(physics);
        
        if(groupWrapper.isFixed()) {

            newGroup.toggleBodyFixed();

        }

    });

    groupWrapper.exitScene(scene);
    groupWrapper.destroy();

}


export function makeGroup(objectArray, scene) {
    
    var group_object = new THREE.Object3D();

    group_object.userData.$type = "AssemGroup";
    group_object.userData.groupId = groupIdCount++;
    group_object.name = objectArray[0].name;

    for(var i = 0; i < objectArray.length; i++) {
        
        if(objectArray[i].children.length) {
            logErr("Tried to create group from non shallow object.");
        }

        objectArray[i].userData.groupId = group_object.userData.groupId;

        // Keep the object in its current world position.
        var inversionMatrix = new THREE.Matrix4();
        inversionMatrix.getInverse(group_object.matrix);
        objectArray[i].applyMatrix(inversionMatrix);

        THREE.SceneUtils.attach(objectArray[i], scene, group_object);

    }

    const wrapper = new GroupWrapper(group_object);
    GroupMap[group_object.userData.groupId] = wrapper;

    wrapper.enterScene(scene);

    return wrapper;
}


function makeGroupFromObject(object, scene) {

    object.userData.$type = "AssemGroup";
    object.userData.groupId = groupIdCount++;
    
    for(var i = 0; i < object.children.length; i++) {
        
        if(object.children[i].children.length) {
            log.warn("Tried to create group from non shallow object.");
        }

        object.children[i].userData.groupId = object.userData.groupId;
    }

    const wrapper = new GroupWrapper(object);
    GroupMap[object.userData.groupId] = wrapper;

    wrapper.enterScene(scene);

    return wrapper;
}

export function loadGroupFromExistingGroupObject(object, serializedData, physicsWorld, scene) {

    if(object.userData.$type !== "AssemGroup") {
        logErr("Cannot load group from non group object");
    }

    if(GroupMap[object.userData.groupId]) {
        logErr("Group already loaded");
    }

    const wrapper = new GroupWrapper(object);

    wrapper._mass = serializedData.mass;
    wrapper._fixed = serializedData.fixed;
    wrapper.name = serializedData.name;
    wrapper.collidesWith = serializedData.collidesWith;
    wrapper.collisionGroup = serializedData.collisionGroup;
    wrapper.id = serializedData.id;

    GroupMap[object.userData.groupId] = wrapper;
    
    wrapper.initPhysics(physicsWorld, false);

}

export function flattenToGroup(object, scene) {
    
    var flat = flatten(object, scene);

    return makeGroupFromObject(flat, scene);

}

export function updateGroups() {

    for(let groupKey in GroupMap) {

        GroupMap[groupKey].update();

    }

    for(let i = 0; i < toRemove.length; i++) {
        delete GroupMap[toRemove[i]];
    }

    toRemove = [];

}

export function groupWrapperFromObject(obj) {
    
    if(!obj.userData.groupId) {

        logErr("Tried to get group wrapper from non grouped object");

    }

    return GroupMap[obj.userData.groupId];
}

export function groupWrapperFromId(id) {

    return GroupMap[id];

}


export function getAllChildrenInAllGroups() {
    
    let allChildren = [];

    for(let groupKey in GroupMap) {
        allChildren = allChildren.concat(GroupMap[groupKey].children());
    }

    return allChildren;
}

export function getAllGroups() {

    const groups = [];

    for(let groupKey in GroupMap) {

        groups.push(GroupMap[groupKey]);

    }

    return groups;
}

function flatten(object, scene) {

    var root = object;

    var objects = [];

    var removeList = [];

    object.traverse(node => {
        if(node.parent && node.parent.type !== "Scene") {

            removeList.push(()=>{ 
                THREE.SceneUtils.detach(node, node.parent, scene);
                THREE.SceneUtils.attach(node, root, scene);
            });

            objects.push(node);
        }
    });

    removeList.forEach(f => f());

    // Objects must have geometry or we throw them away.
    objects = objects.filter(o => !!o.geometry);
    objects.forEach(o => root.add(o));

    root.scale.set(1, 1, 1);

    return root;
}
