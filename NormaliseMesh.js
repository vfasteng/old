import { calculateCentriod } from './GeometryUtils';

export function normaliseMesh(geometry, scale = 1.0) {

    var maxLengthSquared = 0;
    for(var i = 0; i < geometry.vertices.length; i++)
    {
        var lengthSquared = geometry.vertices[i].lengthSq();
        if(lengthSquared > maxLengthSquared) {
            maxLengthSquared = lengthSquared;
        }
    }

    const inverseScale = scale/Math.sqrt(maxLengthSquared);

    scaleMesh(geometry, inverseScale);

    return 1/inverseScale;

}

export function scaleMesh(geometry, scale) {

    for(var i = 0; i < geometry.vertices.length; i++)
    {
        geometry.vertices[i].multiplyScalar(scale);
    }

    geometry.verticesNeedUpdate = true;
}

export function normaliseCenter(object) {

    const centroid = calculateCentriod(object.geometry.vertices);

    for(var i = 0; i < object.geometry.vertices.length; i++) {

        // Move vert to local centroid space.
        object.geometry.vertices[i].sub(centroid);
    }

    // Move the object centroid world position to preserve vert world position.
    object.position.add(centroid);
}

export function normaliseObject(object, scale) {

    const reverseScaleCoef = normaliseMesh(object.geometry, scale);

    // TODO: potential loss of information here.
    object.matrix.identity();

    return reverseScaleCoef;
}