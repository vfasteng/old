import * as THREE from 'three';
import './GLTFLoader';
import './GLTFExporter';
import { COLORS } from './Colors';
import { GroupWrapper, loadGroupFromExistingGroupObject } from './Group'
import { serializeConstraintWrapper ,deserializeConstraintWrapper } from './Physics/ConstraintSystem/Constraints/ConstraintWrappers/ConstraintWrapperSerialization';
const jetpack = require('fs-jetpack');
const { dialog } = require('electron').remote


export class SaveLoad {

    constructor(){

    }

    save(world, filename) {

        const data = {};
        let groups = world.getGroups();
        let constraints = world.physics.constraintStore.getConstraints();

        data.groupMap = {};
        data.groups = [];


        groups.filter(x => x._alive).forEach(group => {

            data.groupMap[group.id] = {
                id: group.id,
                name: group.name,
                collisionGroup: group.collisionGroup,
                collidesWith: group.collidesWith,
                mass: group._mass,
                fixed: group._fixed,
                position: group.obj.position,
                rotation: group.obj.rotation
            };

            data.groups.push(group.id);

        });

        data.constraints = constraints.map(c => serializeConstraintWrapper(c));

        
        var exporter = new THREE.GLTFExporter();

        var container = new THREE.Object3D();

        groups.forEach( group => {
            
            container.add(group.obj);

        });

        // Parse the input and generate the glTF output
        exporter.parse( container, function ( gltf ) {
            
            jetpack.write(filename, data);
            jetpack.write(filename + '.gltf', gltf);

            groups.forEach( group => {
                
                container.remove(group.obj);
                world.scene.add(group.obj);

            });


        }, {} );

    }


    load(world, filename) {

        world.deleteAllGroups();

        // Instantiate a loader
        var loader = new THREE.GLTFLoader();
        
        const gltfData = jetpack.read(filename + '.gltf');
    
        // Load a glTF resource
        loader.parse(
            gltfData,
            '',
            function success( gltf ) {
    
                world.scene.add( gltf.scene );
    
                gltf.animations; // Array<THREE.AnimationClip>
                gltf.scene; // THREE.Scene
                gltf.scenes; // Array<THREE.Scene>
                gltf.cameras; // Array<THREE.Camera>

                const data = jetpack.read(filename, 'json');

                // Find the group scene objects
                const groupObjects = gltf.scene.children[0].children;



                groupObjects.forEach(obj => {

                    // We need to convert the buffer geometry to normal geometry.
                    // supporting buffer geometry is a big job.
                    const newChildren = [];

                    obj.children.forEach(child => {
                        
                        // The conversion from buffer geometry will stop us changing face colors
                        // if the geometry has vertex colours set.
                        child.geometry.attributes.color = undefined;
                        const newGeom = new THREE.Geometry().fromBufferGeometry(child.geometry);

                        const mat = new THREE.MeshPhongMaterial({color: COLORS.OBJECT_BASE_COLOR });
                        mat.vertexColors = THREE.FaceColors;

                        const newChild = new THREE.Mesh(newGeom, mat);

                        // Stuff like groupId is stored here.
                        newChild.userData = child.userData;
                        newChild.position.copy(child.position);
                        newChild.quaternion.copy(child.quaternion);

                        newChildren.push(newChild);

                    });

                    // Clone the array so we can modify it while iterating.
                    // remove all children
                    obj.children.splice(0).forEach(child => obj.remove(child));

                    // Add in the Direct Geometry replacements.
                    newChildren.forEach( child => obj.add(child) );


                    loadGroupFromExistingGroupObject(obj, data.groupMap[obj.userData.groupId], world.physics, world.scene );


                });

                for(var i = 0; i < data.constraints.length; i++) {
                    deserializeConstraintWrapper(data.constraints[i], world.physics);
                }
    
            },

            // called when parsing has errors
            function ( error ) {
    
                console.trace();
                console.log(error);
                throw error;
    
            }
        );

    }

}