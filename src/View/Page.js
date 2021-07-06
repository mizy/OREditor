
import Cursor from "./Cursor";
class Page{
    constructor(editor){
        this.editor = editor;
        this.option = editor.option;
        this.init();
    }

    init(){
        this.initDOM();
        this.cursor = new Cursor(this)
    }
    initDOM(){
        this.dom = document.createElement('div');
        this.dom.classList.add("ore-page");
        this.dom.style.width  = this.option.width+'px';
        this.dom.style.height = this.option.height + 'px';
        this.editor.dom.appendChild(this.dom);
        this.svg = document.createElement('svg');
        this.svg.classList.add("ore-canvas");
        this.svg.style.width = `${this.option.width}px`;
        this.dom.append(this.svg)
    }
}
export default Page;