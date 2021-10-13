
class Cursor{
    isFocus = true;
    height=20;
    composition=false;
    constructor(page){
        this.page = page;
        this.option = page.option;
        this.x = this.option.padding.x;
        this.y = this.option.padding.y;
        this.init();
    }

    init(){
        this.dom = document.createElement('input');
        this.dom.classList.add("ore-cursor");
        this.page.dom.appendChild(this.dom);
        this.dom.focus();
        this.addEvents();
    }

    addEvents(){
        const {renderer,editor} = this.page;
        this.dom.addEventListener("blur",()=>{
            this.isFocus = true;
            this.dom.classList.add("blur")
        })
        this.dom.addEventListener("focus",()=>{
            this.isFocus = false;
            this.dom.classList.remove("blur")
        });
        //是否处于中文
        let compositionIndex;
        let beforeLength = 0;
        this.dom.addEventListener("keydown",(e)=>{
            if(e.key==="Tab"){
                const {activeComponent} = renderer;
                e.preventDefault();
                activeComponent.spliceChar(activeComponent.index,0,'\t');
                this.relocate();
                this.dom.value = '';
            }
        })
        this.dom.addEventListener("input",(e)=>{
            e.preventDefault();
            // if(!this.focus)return;
            if(this.page.section.paths.length){//有选中时，先删除选中项
                editor.keyboard.execute("Delete");
                compositionIndex = renderer.activeComponent.index;
            }
            this.checkStyle();
            const text = this.dom.value;
            const {activeComponent} = renderer;

            if(!this.composition&&text){
                activeComponent.spliceChar(activeComponent.index,0,text);
                this.relocate();
                this.dom.value = '';
            }else{
                //替换文字
                activeComponent.spliceChar(compositionIndex,beforeLength,text);
                activeComponent.index = compositionIndex+text.length;
                beforeLength = text.length;
                this.relocate();
            }
        });
        this.dom.addEventListener('compositionstart',(e)=>{
            compositionIndex = this.style?0:renderer.activeComponent.index;
            this.composition = true;
        });
        this.dom.addEventListener("compositionend",(e)=>{
            this.composition = false;
            renderer.activeComponent.index = compositionIndex + this.dom.value.length;
            this.dom.value = '';
            beforeLength = 0;
            this.relocate();
        });
    }

    checkStyle(){
        const {style} = this;
        const {renderer} = this.page;
        if(style){
            const {activeComponent} = renderer;
            const {index,parent,data,style:nowStyle} = activeComponent; 
            let flag = true;
            for(let key in style){
                if(style[key]!==nowStyle[key]){
                    flag = false;
                }
            }
            //是否新增标签·
            if(flag){
                return
            }
            const length = data.length;
            const componentIndex = parent.children.indexOf(activeComponent); 
            const spliceData = activeComponent.toJSON();
            const nowData = {
                style:{
                    ...spliceData.style,
                    ...style,
                },
                data:""
            };
            let now;
            if(index===0){
                now = parent.insertSpan(componentIndex,nowData);
            }else if(index===length){
                now = parent.insertSpan(componentIndex+1,nowData);
            }else{
                const spliceChar = activeComponent.spliceChar(index,activeComponent.data.length-index);
                spliceData.data = spliceChar;
                now = parent.insertSpan(componentIndex+1,nowData);
                parent.insertSpan(componentIndex+2,spliceData);

            }
            renderer.activeComponent = now;
            now.index = 0;
            parent.update(true);//简单点
            this.style = undefined;
        }
    }

    setStyle(style){
        this.style = style;
        this.focus(true);
    }
    
    moveTo({x,y,textHeight=0,height}){
        const {renderer} = this.page;
        this.x = x + renderer.x;
        this.y = y + renderer.y ;
        this.update();
        this.focus();
    }

    getGlobalXY(event){
        const {rect,renderer} = this.page; 
        let {offsetX,offsetY,target} = event;
        let  disX = 0;let disY = 0;
        while(target!==this.page.editor.dom){
            if(target instanceof HTMLElement){
                disX += target.offsetLeft;
                disY += target.offsetTop;
            }
            target = target.parentElement;
        }
         //获取到画布坐标系的坐标
        const x = offsetX + disX - rect.x - renderer.x;
        const y = offsetY + disY - rect.y - renderer.y;
        return {
            x,
            y
        }
    }

    /**
     * 根据事件坐标 - Page的屏幕坐标 - 偏移获取画布坐标系的坐标
     * @param {MouseEvent} event 
     */
     locate(event){
        const {rect,renderer} = this.page; 
        const {x,y} = this.getGlobalXY(event);
        const res = renderer.findPosition(x,y); 
        this.x = res.x + renderer.x;
        this.y = res.y + renderer.y;
        this.height = res.height;
        this.update();
        this.focus();
    }

    relocate(){
        const {renderer} = this.page;
        const {activeComponent} = renderer;
        const res = activeComponent.getPositionByIndex(activeComponent.index);
        this.x = res.x + renderer.x;
        this.y = res.y + renderer.y;
        this.update();
        this.focus();
    }

    focus(silent=false){
        this.dom.focus();
        if(!silent)this.page.editor.fire("focus")
    }

    hide(){
        this.dom.style.zIndex = '-1';
    }

    show(){
        this.dom.style.zIndex = '1';
    }

    update(){
        const {renderer} = this.page;
        const {activeComponent} = renderer;
        this.style = undefined;
        this.dom.style.height = activeComponent.lineHeight + 'px';
        this.dom.style.fontSize = activeComponent.fontSizeHeight + 'px';
        this.dom.style.transform = `translate(${this.x}px,${this.y}px)`;
    }
}
export default Cursor;