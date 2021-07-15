class Measure{
    constructor(page){
        this.page = page;
        this.initDOM();
    }    
    initDOM(){
        this.canvas = document.createElement("canvas");
        this.page.dom.append(this.canvas);
        this.canvas.classList.add("measure-canvas");
        this.ctx = this.canvas.getContext("2d");
    }

    getSizeHeight(fontSize=14){
        return fontSize+(fontSize>30?2:1)
    }


    measure(text,fontSize=14){
        const {fontRectCache} = this.page.renderer;
        if(fontRectCache[text]){
            return fontRectCache[text]
        }
        this.ctx.font = `${fontSize}px Arial`;

        const textMatric = this.ctx.measureText(text);
        fontRectCache[text] = parseFloat(textMatric.width.toFixed(1));
        return fontRectCache[text]
    }
}
export default Measure;