
class Cursor{
    x=0;
    y=0;
    isFocus = true;
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
        this.dom.addEventListener("blur",()=>{
            this.isFocus = true;
            this.dom.classList.add("blur")
        })
        this.dom.addEventListener("focus",()=>{
            this.isFocus = false;
            this.dom.classList.remove("blur")
        });
        // let composition = false;
        // const compositionPos = {
        //     start:0,
        //     end:0
        // }
        // this.dom.addEventListener("input",(e)=>{
        //     e.preventDefault();
        //     if(!this.focus)return;
        //     const text = this.input.textContent;
        //     const range = document.createRange();

        //     if(!composition){
        //         this.activeComponent.accpet(text,this.startPos.offset,this.startPos.offset);
        //         this.input.innerHTML = '';
        //         const offset = ++this.startPos.offset;
        //         const activeNode = this.activeComponent.getActiveNode();
        //         // 获取当前组件的活跃文字节点
        //         range.setStart(activeNode,offset);
        //         range.setEnd(activeNode,offset);
        //         const pos = range.getBoundingClientRect();
        //         this.moveCursor(pos);
        //     }else{
        //         //替换文字
        //         this.activeComponent.accpet(text,compositionPos.start,compositionPos.end);
        //         const activeNode = this.activeComponent.getActiveNode();
        //         compositionPos.end = compositionPos.start + text.length;
        //         range.setStart(activeNode,compositionPos.end);
        //         range.setEnd(activeNode,compositionPos.end);
        //         const pos = range.getBoundingClientRect();
        //         this.moveCursor(pos);
        //     }
        // });
        // this.dom.addEventListener('compositionstart',(e)=>{
        //     composition = true;
        //     compositionPos.start = this.startPos.offset;
        //     compositionPos.end = this.startPos.offset;
        //     console.log(this.startPos.offset)
        // });
        // this.dom.addEventListener("compositionend",(e)=>{
        //     composition = false;
        //     if(!this.activeComponent)return;
        //     const text = this.input.textContent;
        //     this.input.innerHTML = '';
        // });
        // this.dom.addEventListener("keydown",(e)=>{
        //     if(!this.focus)return;
        //     if(e.code === 'Backspace'){
        //         const selection = document.getSelection();
        //         const range = selection.getRangeAt(0);
        //         if(document.activeElement===this.input){
        //             this.activeComponent.backdelete(this.startPos.offset-1,this.startPos.offset);
        //             this.startPos.offset--;
        //             const activeNode = this.activeComponent.getActiveNode();
        //             const range = document.createRange();
        //             range.setStart(activeNode,this.startPos.offset);
        //             range.setEnd(activeNode,this.startPos.offset);
        //             const pos = range.getBoundingClientRect();
        //             this.moveCursor(pos)
        //         }
        //     }
        // })
    }
    
    moveTo({x,y}){
        const {renderer} = this.page;
        this.x = x + renderer.x;
        this.y = y + renderer.y;
        this.update();
    }

    /**
     * 根据事件坐标 - Page的屏幕坐标 - 偏移获取画布坐标系的坐标
     * @param {MouseEvent} event 
     */
     locate(event){
        const {rect,renderer} = this.page;
        const {clientX,clientY} = event;
        //获取到画布坐标系的坐标
        const x = clientX - rect.x - renderer.x;
        const y = clientY - rect.y - renderer.y;

        const {children} = renderer;
        let res;
        for(let i = 0 ;i<children.length;i++){
            const child = children[i];
            const {rect} = child;
            if(!rect)continue;
            if(y<(rect.y+rect.height)){
                res = child.findPosition(x,y);
                break;
            }
        }
        if(!res){
            res = children[children.length-1].findPosition(x,y);  
        }
        this.x = res.x;
        this.y = res.y;
        this.update();
    }

    focus(){
        this.dom.focus();
    }

    update(){
        this.dom.style.transform = `translate(${this.x}px,${this.y}px)`;
    }
}
export default Cursor;