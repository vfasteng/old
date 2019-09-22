import * as THREE from 'three';

export function calculateCentriod(positions) {
    
    const sum = new THREE.Vector3();

    for(let i = 0; i < positions.length; i++)
    {
        sum.add(positions[i]);
    }

    sum.multiplyScalar(1.0/positions.length);

    return sum;
    
}

export function getPointInBetweenByPerc(pointA, pointB, percentage) {
    
    var dir = pointB.clone().sub(pointA);
    var len = dir.length();
    dir = dir.normalize().multiplyScalar(len*percentage);
    return pointA.clone().add(dir);

}