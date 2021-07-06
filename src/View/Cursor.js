
class Cursor{
    x=0;
    y=0;
    constructor(page){
        this.page = page;
        this.option = page.option;
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
            this.dom.classList.add("blur")
        })
        this.dom.addEventListener("focus",()=>{
            this.dom.classList.remove("blur")
        })
    }

    focus(){
        this.dom.focus();
    }

    update(){
        this.dom.style.transform = `translate(${this.x}px,${this.y}px)`;
    }
}
export default Cursor;