
import Cursor from "./Cursor";
import Measure from '../Utils/Measure';
import Renderer from '../Components/Renderer';
class Page{
    constructor(editor){
        this.editor = editor;
        this.option = editor.option;
        this.init();
    }

    init(){
        this.initDOM();
        this.cursor = new Cursor(this);
        this.measure = new Measure(this);
        this.renderer = new Renderer(this);
        this.initData([{
            type:"p",
            children:[{
                type:"span",
                data:'afafafafaf'
            }]
        }]);
    }

    initDOM(){
        this.container = document.createElement('div');
        this.container.classList.add("ore-container");
        this.editor.dom.append(this.container)
        this.dom = document.createElement('div');
        this.dom.classList.add("ore-page");
        this.dom.style.width  = this.option.width+'px';
        this.dom.style.height = this.option.height + 'px';
        this.container.appendChild(this.dom);
        this.svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
        this.svg.classList.add("ore-canvas");
        this.svg.setAttribute("width",this.option.width);
        this.dom.append(this.svg);
        this.svgDoc = this.svg.ownerDocument;
        this.addEvents();
    }


    initData(data){
        this.data = data;
        this.renderer.init();
    }
 
    resize(){
        this.rect = this.dom.getBoundingClientRect();
    }

    addEvents(){
    }
}
export default Page;