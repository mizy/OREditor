import Schema from './Schema';
import Content from './Content/index';
import './index.less';

interface InitOptions {
    width:number|undefined,
    height:number|undefined,
}

/**
 * @class Editor
 */
class Editor{
    public dom :HTMLElement;
    public contentEle:HTMLElement;
    public options:InitOptions;
    public content:Content;
    public schema:Schema;
    public events:{
        [key:string]:any[]
    }
    constructor(dom:HTMLElement,options:InitOptions){
        this.dom = dom;
        this.options = options; 
        this.init();
    }
    
    init(){
        this.dom.className+=` meditor`;
        this.initDom();
        this.initEvents();
        this.schema = new Schema(this);
        this.content = new Content(this);
    }

    /**
     * 初始化编辑器内部dom
     */
    initDom(){
        const doms = `
            <div class="content"></div>
            <div id="edit-input" contenteditable="true"></div>
            <div id="cursor"></div>
        `;
        this.dom.innerHTML = doms;
        this.contentEle = this.dom.querySelector(".content");
        this.contentEle.style.width = this.options.width?'auto':this.options.width+'px';
        this.contentEle.style.width = this.options.width?'auto':this.options.width+'px';
    }

    initEvents(){
        this.events = {};
    }

    on(eventName:string,func:any){
        if(!this.events[eventName]){
            this.events[eventName] = [];
        }
        this.events[eventName].push(func)
    }

    off(eventName:string,func:any|undefined):boolean{
        if(!func){
            this.events[eventName] = [];
            return true;
        }
        const index:number = this.events[eventName].indexOf(func);
        if(index>-1){
            this.events[eventName].splice(index,1)
        }
        return true
    }

    fire(eventName:string,data:any){
        this.events[eventName].forEach((func:any)=>{
            func(data)
        })
    }
}
export default Editor;