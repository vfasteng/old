import * as _ from './JSUtils';
import * as THREE from 'three';

export default class FaceUtils {

    constructor() {
        this.clamp = true;
        this.pendingRecursive = 0;
        this.__vertexNames = ['a','b','c'];
    }
    
    vertexHash(geometry) {
        geometry.vertexHash = [];
        var faces = geometry.faces;
        var vLen = geometry.vertices.length;
        for(var i=0;i<vLen;i++){
            geometry.vertexHash[i] = [];
            for(var f in faces){
                if(faces[f].a == i || faces[f].b == i || faces[f].c == i){
                    geometry.vertexHash[i].push(faces[f])};
            }
        }
    }

    __ensureHash(geometry) {
        if(geometry.vertexHash == undefined){
            this.vertexHash(geometry);
        }
    }

    getCoplanar(maxAngle, geometry, face, clamp, out, originFace) {

        if(this.originFace == undefined){
            this.originFace = face;
        }
        
        this.result = out;
        if(out == undefined){
            this.result = {count:0};
        }
        
        this.__ensureHash(geometry);
        
        this.pendingRecursive++;
        
        for (var i in this.__vertexNames) {
            var vertexIndex = face[this.__vertexNames[i]];
            var adjacentFaces = geometry.vertexHash[vertexIndex];
            for(var a in adjacentFaces) {
                var newface = adjacentFaces[a];
                var testF = this.originFace;
                if(clamp == false){
                    testF = face
                }
                if(testF.normal.angleTo(newface.normal) * (180/ Math.PI) <= maxAngle) {
                    if(this.result["f"+newface.a+newface.b+newface.c] == undefined) {
                        this.result["f"+newface.a+newface.b+newface.c] = newface;
                        this.result.count++;
                        this.getCoplanar(maxAngle, geometry, newface, clamp, this.result, this.originFace);
                    }
                }
            }
        }
        this.pendingRecursive--;
    
        if(this.pendingRecursive == 0 && this.onCoplanar != undefined){
            delete this.result.count;
            this.onCoplanar(this.result);
        }

    }
    
    
    /**
     * @param  {THREE.Geometry} geometry - The mesh geometry
     * @param  {THREE.Face3} face -The intersected face
     * @param  {THREE.Vector3} point - The point in world space
     * @param  {THREE.Matrix4} matrixWorld - The world matrix
     * @returns {Object} - The nearest vertex
     */
    getNearestVertex(geometry, face, point, matrixWorld) {
        
        var worldToLocal = new THREE.Matrix4();

        worldToLocal.getInverse(matrixWorld);

        point.applyMatrix4(worldToLocal);
        
    
        const faceVerticies = this.__vertexNames.map((v) => {
            
            const index = face[v];
            const vertex = geometry.vertices[index];

            return {
                vertex,
                distance: point.distanceToSquared(vertex),
                index: index
            };
        });

        
        var min = Number.MAX_SAFE_INTEGER;
        var minVertInfo = faceVerticies[0];

        faceVerticies.forEach( vertexInfo => {
            if(vertexInfo.distance < min) {
                min = vertexInfo.distance;
                minVertInfo = vertexInfo;
            }
        });

        return minVertInfo;
    }

    

    distancePointToSegment(v, a, b ) {
        var ab = b.clone().sub(a);
        var av = v.clone().sub(a);
    
        if (av.dot(ab) <= 0.0)
            return av.length();
    
        var bv = v.clone().sub(b) ;
    
        if (bv.dot(ab) >= 0.0) 
            return bv.length()
    
        return (ab.clone().cross( av )).length() / ab.length();
    }

    
    /**
     * @param  {THREE.Geometry} geometry - The geometry of the mesh
     * @param  {THREE.Face3} face -The face the point intersects
     * @param  {THREE.Vector3} point - The point in world space
     * @param  {THREE.Matrix4} matrixWorld - matrixWorld
     * @returns {Array<THREE.Vector3>} - The two verticies of the closest edge transformed to world space
     */
    getNearestEdge(geometry, face, point, matrixWorld) {

        const verts = this.__vertexNames.map((v) => {

            const index = face[v];
            
            return geometry.vertices[index].clone().applyMatrix4(matrixWorld);

        });

        const distances = [
            this.distancePointToSegment(point, verts[0], verts[1]),
            this.distancePointToSegment(point, verts[1], verts[2]),
            this.distancePointToSegment(point, verts[2], verts[0])
        ];


        const max = _.indexOfMin(distances);

        if(max === 0) {
            return [verts[0], verts[1]];
        } else if (max === 1) {
            return [verts[1], verts[2]];
        }

        return [verts[2], verts[0]];
    }

    getNearestEdgeLocal(geometry, face, point, matrixWorld) {

        var worldToLocal = new THREE.Matrix4();
        
        worldToLocal.getInverse(matrixWorld);

        point.applyMatrix4(worldToLocal);

        const verts = this.__vertexNames.map((v) => {

            const index = face[v];

            return {
                vector: geometry.vertices[index].clone(),
                index: index
            }

        });

        const distances = [
            this.distancePointToSegment(point, verts[0].vector, verts[1].vector),
            this.distancePointToSegment(point, verts[1].vector, verts[2].vector),
            this.distancePointToSegment(point, verts[2].vector, verts[0].vector)
        ];


        const max = _.indexOfMin(distances);

        if(max === 0) {
            return [verts[0], verts[1]];
        } else if (max === 1) {
            return [verts[1], verts[2]];
        }

        return [verts[2], verts[0]];

        
    }
}
