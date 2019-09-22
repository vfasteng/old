import * as _ from './JSUtils';

export default class DebugTextRenderer {

    constructor() {
        
        this._drawCount = 0;
        this._divRecycleBuffer = [];

        this._lastDivMap = {};
        this._divMap = {};

        this.visible = false;

    }


    update() {

        // For everything we drew last frame.
        for(var key in this._lastDivMap) {

            // Did we not draw it this frame.
            if(!this._divMap[key]) {

                // Make it disapear because its no longer in frame.
                this._recycleDiv(this._lastDivMap[key]) 

            }

        }

        this._lastDivMap = this._divMap;
        this._divMap = {};
    }

    _recycleDiv(div) {

        div.innerHTML = "";
        div.style.hidden = true;
        this._divRecycleBuffer.push(div);

    }

    _freshDiv() {

        if(this._divRecycleBuffer.length) {
            const div =  this._divRecycleBuffer.pop();
            div.style.hidden = false;
            return div;
        }

        var div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
        div.style.color = "rgba(255, 255, 255, 1)";
        div.style.maxWidth = 130 + 'px';
        div.style.pointerEvents = "none"
        div.style.fontSize = "9pt";
        div.style.fontWeight = "bold";
        document.body.appendChild(div);

        return div;
    }

    _draw(text, position, id) {

        // Did we already draw this last frame?
        let div = this._lastDivMap[id];

        if(!div) {
            // No we didn't, create a new div.
            div = this._freshDiv();
        }

        // Update the map for this frame.
        this._divMap[id] = div;

        const html = "<span>" + text.split(/\n/).join("</span><br/><span>")

        div.innerHTML = html;

        div.style.left = position.x + 'px';
        div.style.top = position.y + 'px';
    }

    toggleVisible() {
        this.visible = !this.visible;
    }

    drawObjInfo(obj) {

        if(this.visible) {

            let text = 
            `   ${obj.name}
                x: ${obj.position.x.toFixed(4)}
                y: ${obj.position.y.toFixed(4)}
                z: ${obj.position.z.toFixed(4)}
            `;
    
            if(obj.userData.debugInfo) {
                text += obj.userData.debugInfo;
            }
    
            // @ts-ignore
            const pos = world.worldToScreen(obj);
            this._draw(text, pos, obj.id);

        }

    }


}