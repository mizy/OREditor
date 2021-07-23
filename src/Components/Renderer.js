
import * as components from './index'
/**
 * @class
 */
class Renderer{
    activeComponent = undefined
    children = [];
    constructor(page){
        this.page = page;
        this.initDOM();
    }

    initDOM(){
        const {padding,width} = this.page.option;
        this.x = padding.x;
        this.y = padding.y;
        this.width = width - 2*this.x;
        this.g = this.createElementNS("g");
        this.g.setAttribute("transform",`translate(${this.x},${this.y})`)
        this.page.svg.appendChild(this.g);
        this.initTestDOM();
    }

    initTestDOM(){
        this.g.append(this.$(`<g><path stroke-width="1" stroke="red" d="M0 0 L560 0"></path>
        <path stroke="red" stroke-width="1" d="M0 0 L0 560"></path></g>`))
    }

    /**
     * 初始化数据
     */
    init(){
        const {data} = this.page;
        let nowXY = {
            x:0,
            y:0
        };
        data.forEach(eachData=>{
            const Item = components[eachData.type||'p'];
            const instance = new Item(eachData,this,{
                ...nowXY
            });
            const bbox = instance.getBBox();
            nowXY.y += bbox.height;
            this.children.push(instance)
        });
        // 默认到初始化位置
        this.children.forEach((item,index)=>{
            const prev = this.children[index-1];
            const next = this.children[index+1];
            item.prev = prev;
            item.next = next;
        });
        this.headChild = this.children[0];
        this.activeComponent = this.headChild.headChild;
        this.activeComponent.index = 0;
        this.page.cursor.relocate();
    } 
    
    createElementNS(tag,ns){
        return this.page.svgDoc.createElementNS(ns||'http://www.w3.org/2000/svg',tag)
    }

    /**
     * svg替换内部文本
     * @param {SVGElement} node 
     * @param {Object} data 
     * @returns 
     */
    innerText(node,data){
        const tspan = this.createElementNS('tspan');
        tspan.appendChild(this.page.svgDoc.createTextNode(data));
        tspan.normalize && tspan.normalize();

        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
        while (tspan.firstChild) {
            node.appendChild(tspan.firstChild);
        }
        return node;
    }


    $(svgText) {
        const parser = new DOMParser()
            , xmlText =  "<svg xmlns=\'http://www.w3.org/2000/svg\'>" +
                svgText + "</svg>"
            , docElem = parser.parseFromString(xmlText, "text/xml").documentElement

        const node = docElem.firstChild;
        this.page.svgDoc.importNode(node, true);
        return node
    }
    
    findPosition(x,y){
        const {children} = this;
        let res;
        for(let i = 0 ;i<children.length;i++){
            const child = children[i];
            const {rect,bbox} = child;
            if(!rect)continue;
            if(y<(bbox.y+bbox.height)){
                res = child.findPosition(x,y);
                break;
            }
        }
        if(!res){
            res = children[children.length-1].findPosition(x,y);  
        }
        this.activeComponent = res.component;
        return res;
    }


}
export default Renderer;