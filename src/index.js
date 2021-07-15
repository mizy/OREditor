/**
 * @author mizy
 * @see https://github.com/mizy/OREditor
 */
import Page from './View/Page'

import './index.less'
class OREditor {
    constructor(container,option){
        this.container = container;
        this.option = Object.assign({
            height:600,
            padding:{
                x:20,y:20
            }
        },option);
        this.init();
        window.editor = this;
    }
    
    init(){
        this.initDOM();
        this.page = new Page(this);
        requestAnimationFrame(()=>{
            this.resize();
        })
        this.addEvent();
    }

    initDOM(){
        this.dom = document.createElement("div");
        this.dom.classList.add("oreditor");
        this.container.appendChild(this.dom);
        const width = this.container.offsetWidth;
        const height = this.container.offsetHeight;
        if(!this.option.width){
            this.option.width = width
        }
        if(!this.option.height){
            this.option.height = height
        }
       
    }

    resize(){
        this.rect = this.dom.getBoundingClientRect();
        this.page.resize()
    }

    addEvent(){
        this.dom.addEventListener('click',(event)=>{
            this.page.cursor.locate(event)
        })
    }
}
export default OREditor;