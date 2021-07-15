import Base from './Base';
import * as components from './index'

/**
 * @class
 */
class P extends Base{
    children=[];
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

    // 初始化子节点
    initChildren(){
        const {children} = this.data;
        this.textHeights = [];
        let nowXY;
        children.forEach(child=>{
            const Comp = components[child.type];
            const instance = new Comp({
                data:child,
                parent:this,
                globalPos:nowXY
            });
            const {rect} = instance;
            nowXY = {x:rect.endX,y:rect.endY};
            this.children.push(instance)
        })
    }

    // 获取的位置
    getPositionByIndex(index=0){
        const child = this.children[index];
        return child.getPositionByIndex(index);
    }

    findPosition(x,y){
        const child = this.findClosetChild(x,y);
        // 所有的子元素中都没有找到最近的，就默认变成段落的第一个
        let res = child.findPosition(x,y);
        return res;
    }

    findClosetChild(x,y){
        const {children} = this;
        const inHeightChildren = [];
        // 先检索出在高度范围内的所有子元素
        children.forEach(child=>{
            const {bbox} = child;
            if(y>bbox.y&&y<(bbox.y+bbox.height)){
                inHeightChildren.push(child);
            }
        });
        if(!inHeightChildren[0]){
            return children[0]
        }
        const innerChildren = []
        inHeightChildren.forEach(child=>{
            const {bbox} = child;
            if(x>bbox.x&&x<(bbox.x+bbox.width)){
                innerChildren.push(child)
            }
        })
        //没有在内部的则取第一个高度符合的
        if(!innerChildren.length){
            return inHeightChildren[0]
        }
        let final;
        
        innerChildren.find(child=>{
            const {rect,textHeights} = child;
            if(rect.y === rect.endY){
                if(x<rect.endX&&x>rect.x){
                    final = child;
                    return true;
                }
            }else{
                const lastY = this.rect.endY - textHeights.slice(-1)[0];
                if( (y<rect.y&&x>rect.x&&x<this.rect.endX)
                || (y>=rect.y&&y>=rect.y&&y<lastY)
                || (y>=rect.y&&y>=lastY&&y<this.rect.endY)){
                    final = child;
                    return true;
                }
            }
        })
        if(!final){
            return innerChildren[0]
        }
        return final;
    }

    update(){
        this.bbox = this.dom.getBBox();
        this.rect = {
            ...this.globalPos,
            endX :this.globalPos.x+this.bbox.width,
            endY :this.globalPos.y+this.bbox.height
        }
    }
}
export default P;