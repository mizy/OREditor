
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
        const {renderer} = this.page;
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
        this.dom.addEventListener("input",(e)=>{
            e.preventDefault();
            if(!this.focus)return;
            const text = this.dom.value;

            if(!this.composition&&text){
                const {activeComponent} = renderer;
                activeComponent.spliceChar(activeComponent.index,0,text);
                this.relocate();
                this.dom.value = '';
            }else{
                //替换文字
                const {activeComponent} = renderer;
                activeComponent.spliceChar(compositionIndex,beforeLength,text);
                activeComponent.index = compositionIndex+text.length;
                beforeLength = text.length;
                this.relocate();
            }
        });
        this.dom.addEventListener('compositionstart',(e)=>{
            compositionIndex = renderer.activeComponent.index;
            this.composition = true;
        });
        this.dom.addEventListener("compositionend",(e)=>{
            this.composition = false;
            console.log( this.dom.value);
            renderer.activeComponent.index = compositionIndex + this.dom.value.length;
            this.dom.value = '';
            beforeLength = 0;
            this.relocate();
        });
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

    focus(){
        this.dom.focus();
    }

    hide(){
        this.dom.style.display = 'none';
    }

    show(){
        this.dom.style.display = 'block';
    }

    update(){
        const {renderer} = this.page;
        const {activeComponent} = renderer;
        this.dom.style.height = activeComponent.lineHeight + 'px';
        this.dom.style.fontSize = activeComponent.fontSizeHeight + 'px';
        this.dom.style.transform = `translate(${this.x}px,${this.y}px)`;
    }
}
export default Cursor;