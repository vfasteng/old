// @ts-nocheck
var activePrimitives = [];
var activeMesh = null;
var displayOnTop = false;
var visible = false;

module.exports = function(THREE) {
    function Primitive() {
        this.vertices = [];
        this.color = 0x000000;
    }

    function _addPrimitive(p) {
        activePrimitives.push(p);
    }

    function constructGeometry() {
        var positions = [];
        var colors = [];
        var indices = [];

        // Collect all primitives into geometry buffers.
        var i, j;
        var indexOffset = 0;
        for (i = 0; i < activePrimitives.length; i++) {
            var p = activePrimitives[i];

            // Vertices/colors.
            for (j = 0; j < p.vertices.length; j++) {
                var v = p.vertices[j];
                positions.push(v.x, v.y, v.z);
                colors.push(p.color & 0xFF0000, p.color & 0xFF00, p.color & 0xFF);
            }

            // Indices.
            for (j = 0; j < p.vertices.length -1; j++) {
                indices.push(indexOffset + j, indexOffset + j + 1);
            }
            indexOffset += p.vertices.length;
        }

        // Construct geometry.
        indices = new Uint16Array(indices);
        positions = new Float32Array(positions);
        colors = new Float32Array(colors);

        var geometry = new THREE.BufferGeometry();

        geometry.setIndex(new THREE.BufferAttribute(indices, 1))
        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.computeBoundingSphere();
        return geometry;
    }

    function _update(scene) {
        
        if (activeMesh !== null) {
            scene.remove(activeMesh);
            activeMesh.geometry.dispose();
            activeMesh.geometry = undefined;
            activeMesh = null;
        }

        if (activePrimitives.length === 0) {
            return;
        }

        // Create geometry and add to scene.
        var geometry = constructGeometry();
        var material = new THREE.LineBasicMaterial({ vertexColors: true });
        activeMesh = new THREE.LineSegments(geometry, material);
        activeMesh.visible = visible;
        
        if(displayOnTop) {
            activeMesh.renderOrder = 999;
            activeMesh.onBeforeRender = function( renderer ) { renderer.clearDepth(); };    
        } else {
            activeMesh.onBeforeRender = function(){};
        }
        
        scene.add(activeMesh);

        // Clear primitives from this frame.
        activePrimitives = [];
        
    }

    function _setDisplayOnTop(val) {
        displayOnTop = val;
    }

    function _toggleDisplayOnTop() {
        displayOnTop = !displayOnTop;
    }

    function _getVisible() {
        return visible;
    }

    function _setVisible(val) {
        visible = val;
    }

    return {
        Primitive: Primitive,
        addPrimitive: _addPrimitive,
        update: _update,
        setDisplayOnTop: _setDisplayOnTop,
        toggleDisplayOnTop: _toggleDisplayOnTop,
        getVisible: _getVisible,
        setVisible: _setVisible
    };
};
