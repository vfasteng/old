import * as THREE from 'three';

/**
 * @param  {THREE.Vector3} vector
 * @returns {Array<Number>} jsonSerializableList
 */
export function serializeVector(vector) {
    
    return [vector.x, vector.y, vector.z];

}

/**
 * @param  {Array<Number>} array
 * @returns {THREE.Vector3}
 */
export function deserializeVector(array) {

    return new THREE.Vector3(array[0], array[1], array[2])

}