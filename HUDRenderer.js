export default class HUDRenderer {

    constructor() {


        this._div = document.createElement('div');
        this._span = document.createElement('span');
        this._container = document.createElement('div');

        this._container.style.display = 'flex';
        this._container.style.justifyContent = "flex-end";
        this._container.style.alignItems = "flex-end";
        this._container.style.pointerEvents = "none";
        this._container.style.position = "fixed";

        this._div.style.display = 'flex';
        this._div.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
        this._div.style.color = "rgba(255, 255, 255, 1)";
        this._div.style.padding = "20px"
        this._div.style.fontSize = "24pt";
        this._div.style.fontWeight = "bold";

        this._div.appendChild(this._span);
        this._container.appendChild(this._div);
        document.body.appendChild(this._container);

    }


    draw(info) {

        this._span.innerHTML = info.text;

        this._container.style.width = info.width + "px";
        this._container.style.height = info.height + "px";
    }

}