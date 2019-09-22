export default class DebugHUDRenderer {

    constructor() {

        this._div = document.createElement('div');

        this._div.style.position = 'relative';
        this._div.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
        this._div.style.color = "rgba(255, 255, 255, 1)";
        this._div.style.maxWidth = 130 + 'px';
        this._div.style.pointerEvents = "none"
        this._div.style.fontSize = "8pt";
        this._div.style.fontWeight = "bold";
        this._div.style.top = "5px";
        this._div.style.right = "5px";
        // @ts-ignore
        this._div.style.float = "right";

        
        document.body.appendChild(this._div);

        this.visible = false;

    }


    draw(info) {

        if(this.visible) {

            let html = "";
    
            Object.keys(info).forEach(key => {
    
                html += `<span>${key} : ${info[key]}</span><br/>`;
    
            });
    
            this._div.innerHTML = html;
            // @ts-ignore
            this._div.style.hidden = false;

        } else {
            this._div.innerHTML = "";
            // @ts-ignore
            this._div.style.hidden = true;
        }

    }

    toggleVisible() {
        this.visible = !this.visible;
    }



}