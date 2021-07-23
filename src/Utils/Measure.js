class Measure{
    fontRectCache = {}
    constructor(page){
        this.page = page;
        this.initDOM();
    }    
    initDOM(){
        this.canvas = document.createElement("canvas");
        this.page.dom.append(this.canvas);
        this.canvas.classList.add("measure-canvas");
        this.ctx = this.canvas.getContext("2d");
        this.testSVG = this.page.renderer.createElementNS("text");
        this.testSVG.style.visible="hidden";
        this.testSVG.textContent = '1';
        this.heigtsCache = {};
        this.page.svg.appendChild(this.testSVG);
    }

    getSizeHeight(fontSize=14){
        return fontSize+(fontSize>30?2:1)
    }

    getBBoxHeight(fontSize=14){
        if(this.heigtsCache[fontSize]){
            return this.heigtsCache[fontSize]
        }
        this.testSVG.style.fontSize = fontSize+"px";
        const bbox = this.testSVG.getBBox();
        this.heigtsCache[fontSize] = bbox.height;
        return bbox.height;
    }


    measure(text,fontSize=14){
        const {fontRectCache} = this;
        if(fontRectCache[fontSize]&&fontRectCache[fontSize][text]){
            return fontRectCache[fontSize][text]
        }
        this.ctx.font = `${fontSize}px arial,sans-serif`;

        const textMatric = this.ctx.measureText(text);
        if(!fontRectCache[fontSize]){
            fontRectCache[fontSize] = {}
        }
        fontRectCache[fontSize][text] = parseFloat(textMatric.width.toFixed(1));
        return fontRectCache[fontSize][text];
    }
}
export default Measure;