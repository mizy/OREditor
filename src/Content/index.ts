import Editor from '../index';
import Schema from '../Schema';
import Components from './Components/index';
import {SchemaData,SchemaDataItem } from '../Interface/schema'

class Content{
    editor:Editor;
    schema:Schema;
    id:number = 0;
    components:any[];
    input:HTMLElement;
    cursor:HTMLElement;
    el:HTMLElement;
    activeComponent:any;
    startPos:any;

    constructor(editor){
        this.editor = editor;
        this.schema = editor.schema;
        this.el = editor.contentEle;
        this.input = document.querySelector("#edit-input");
        this.cursor = document.querySelector("#cursor");

        // TODO: 读取数据逻辑
        this.initData();
        this.initEvents();
    }

    initEvents(){
        let mousePos = {x:0,y:0}
        this.el.addEventListener("mousedown",(e)=>{
            mousePos.x =e.screenX;
            mousePos.y=e.screenY 
        })
        this.el.addEventListener("mouseup",(e)=>{
            // 判断是否是真click
            if(Math.abs(e.screenX-mousePos.x)<2&&Math.abs(e.screenY-mousePos.y)<2){
                this.clearCursor();
                this.focus(e.target)
            }
        })
        this.input.addEventListener("blur",()=>{
            this.hideCursor()
        })
        let composition = false;
        const compositionPos = {
            start:0,
            end:0
        }
        this.input.addEventListener("input",(e)=>{
            e.preventDefault();
            if(!this.activeComponent)return;
            const text = this.input.textContent;
            const range = document.createRange();

            if(!composition){
                this.activeComponent.accpet(text,this.startPos.offset,this.startPos.offset);
                this.input.innerHTML = '';
                const offset = ++this.startPos.offset;
                const activeNode = this.activeComponent.getActiveNode();
                // 获取当前组件的活跃文字节点
                range.setStart(activeNode,offset);
                range.setEnd(activeNode,offset);
                const pos = range.getBoundingClientRect();
                this.moveCursor(pos);
            }else{
                //替换文字
                this.activeComponent.accpet(text,compositionPos.start,compositionPos.end);
                const activeNode = this.activeComponent.getActiveNode();
                compositionPos.end = compositionPos.start + text.length;
                range.setStart(activeNode,compositionPos.end);
                range.setEnd(activeNode,compositionPos.end);
                const pos = range.getBoundingClientRect();
                this.moveCursor(pos);
            }
        });
        this.input.addEventListener('compositionstart',(e)=>{
            composition = true;
            compositionPos.start = this.startPos.offset;
            compositionPos.end = this.startPos.offset;
            console.log(this.startPos.offset)
        });
        this.input.addEventListener("compositionend",(e)=>{
            composition = false;
            if(!this.activeComponent)return;
            const text = this.input.textContent;

            this.activeComponent.accpet(text,compositionPos.start,compositionPos.end);
            this.input.innerHTML = '';

            const activeNode = this.activeComponent.getActiveNode();
            const offset = compositionPos.start + text.length;
            this.startPos.offset = offset;
            const range = document.createRange();
            range.setStart(activeNode,offset);
            range.setEnd(activeNode,offset);
            const pos = range.getBoundingClientRect();

            this.moveCursor(pos);
        });
        this.input.addEventListener("keyup",(e)=>{
            if(!this.activeComponent)return;
            console.log(e);
            if(e.code === 'Backspace'){
                const selection = document.getSelection();
                const range = selection.getRangeAt(0);
                console.log(selection,range);
                if(!selection.rangeCount){
                    this.activeComponent.backdelete(this.startPos.offset-1,this.startPos.offset-1)
                }
            }
        })
    }

    autoFocus(){
        const component = this.components[0];
        const target = component.el;
        const pos = target.getBoundingClientRect();
        this.activeComponent = component;
        this.moveCursor(pos);
        this.startPos = {
            offset:0
        }
    }

    /**
     * 
     * @param target 焦点聚焦的dom
     */
    focus(target){
        if(target===this.el){
            this.hideCursor();
            return;
        }
        const component = this.getComponent(target);
        this.activeComponent = component;
        const selection = window.getSelection();
        let pos;let startOffset=0;
        if(selection.rangeCount){
            const range = selection.getRangeAt(0);
            if(range.startOffset===0){
                pos = target.getBoundingClientRect();
            }else{
                startOffset = range.startOffset;
                pos = range.getBoundingClientRect();
            }
        }else{
            pos = component.getBasePose();
        }
        selection.removeAllRanges()
        this.startPos = {
            offset:startOffset
        }
        this.moveCursor(pos);
    }
    

    /**
     * 
     * @param target 根据dom获取对应的组件
     */
    getComponent(target){
        let dom = target;
        let res;let dataId;
        while(!res&&dom&&dom.getAttribute){
            dataId = dom.getAttribute("data-id");
            if(dataId){
                res = dom;
                break;
            }
            dom = dom.parent;
        };
        const component = this.components.find(each=>`${each.id}`===dataId);
        return component;
    }

    moveCursor(pos){
        this.input.style.left = pos.x + 'px';
        this.input.style.top = pos.y + 'px';
        // this.input.style.height = pos.height+'px'
        this.cursor.style.left = pos.x + 'px';
        this.cursor.style.top = pos.y + 'px';
        this.cursor.style.height = pos.height + 'px';
        this.input.focus();
        
    }

    hideCursor(){
        this.activeComponent = undefined;
        this.cursor.style.height = 0+'px';
        this.input.style.left=-9999+'px';
        this.input.style.top=-9999+'px';
    }

    clearCursor(){
        this.input.innerHTML = ''
    }

    /**
     * 初始化数据生成的dom
     */
    initData(){
        this.components = [];
        const data = this.schema.getData();

        data.content.forEach(element => {
            const Component = Components[element.type];
            const component = new Component(element);
            component.id = this.id++;
            component.el.setAttribute("data-id",component.id)
            this.el.appendChild(component.el)
            this.components.push(component);
        });
        this.autoFocus()
    }

    /**
     * 渲染内容区，后续加入renderer渲染器
     */
    update(){
        const data = this.schema.getData();
        
    }
}
export default Content;