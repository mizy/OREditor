import Base from './Base';
import * as components from './index'

/**
 * @class
 */
class P extends Base{
    textSpace=2;
    verticleSpace = 0;
    constructor(data,renderer,globalPos){
        super();
        this.renderer = renderer;
        this.page = renderer.page;
        this.style = data.style||{};
        this.data = data;
        this.globalPos = globalPos;
        this.init();
    }

    init(){
        this.dom = this.renderer.createElementNS('g');
        this.renderer.g.appendChild(this.dom);
        this.dom.classList.add('ore-p');
        this.initChildren();
        this.update()
    }

    initChildren(){
        const {children} = this.data;
        children.forEach(child=>{
            const Comp = components[child.type];
            const instance = new Comp(child,this.renderer,)
        })
    }

    update(){

    }
}
export default P;