import * as THREE from 'three';

export function createMeshShape(geometry, scaleMod) {

    const triMesh = new Ammo.btTriangleMesh();
    
    // Ammo wont let us set the margin so just scale the object
    // so it is the same size with the added margin.
    // The has the effect of rounding the object a little.
    const bulletDefaultMargin = 0.04;
    geometry.computeBoundingSphere();
    const geomSize = geometry.boundingSphere.radius
    const scale = geomSize * scaleMod - bulletDefaultMargin;
    
    const v1 = AMM.freshVector();
    const v2 = AMM.freshVector();
    const v3 = AMM.freshVector();
    
    for(let i = 0; i < geometry.faces.length; i++) {
        
        AMM.copyVector(geometry.vertices[geometry.faces[i].a].clone().multiplyScalar(scale), v1);
        AMM.copyVector(geometry.vertices[geometry.faces[i].b].clone().multiplyScalar(scale), v2);
        AMM.copyVector(geometry.vertices[geometry.faces[i].c].clone().multiplyScalar(scale), v3);

        triMesh.addTriangle(v1, v2, v3, true);

    }
    
    AMM.returnVectors(3);

    const shape = new Ammo.btConvexTriangleMeshShape(triMesh, true);

    return {
        shape,
        triMesh
    };
}

export function createBoxShape(halfExtens) {

    const v = AMM.freshVectorFromThree(halfExtens);
    
    const shape = new Ammo.btBoxShape(v);
    
    return shape;

}

export function createSphereShape(radius) {

    const shape = new Ammo.btSphereShape(radius);

    return shape;

}

export function createCompoundShape(shapes, transforms) {

    const shape = new Ammo.btCompoundShape();

    const orig = AMM.freshVector();
    const quat = AMM.freshQuat();
    

    for(let i = 0; i < shapes.length; i++) {

        const tran = AMM.freshTransform();

        AMM.copyVector(transforms[i].position, orig);
        AMM.copyQuat(transforms[i].quaternion, quat);
        
        tran.setOrigin(orig);
        tran.setRotation(quat);

        shape.addChildShape(tran, shapes[i]);

        AMM.returnTransforms(1);
        
    }

    AMM.returnVectors(1);
    AMM.returnQuats(1);

    return shape;

}