import Base from './Base';
import * as components from './index'

/**
 * @class
 */
class P extends Base{
    // 至少有一个
    children=[];
    lineHeight = {};//这里定义个每行高的组件
    constructor(data,renderer,globalPos){
        super();
        this.renderer = renderer;
        this.page = renderer.page;
        this.style = data.style||{};
        this.data = data;
        this.globalPos = globalPos;
        //右侧边界
        this.rightGap = globalPos.x + renderer.width;
        this.init();
    }

    init(){
        this.dom = this.renderer.createElementNS('g');
        this.renderer.g.appendChild(this.dom);
        this.dom.classList.add('ore-p');
        this.initChildren();
    }

    // 初始化子节点
    initChildren(){
        const {children} = this.data;
        this.textHeights = [];
        let prev;
        const getNext= (i)=>{
            const child = children[i];
            if(!child)return false;
            const Comp = components[child.type];
            const instance = new Comp({
                data:child,
                parent:this,
                prev,
            });
            prev = instance;
            //上面的优先
            this.children.push(instance);
            instance.next = getNext(++i);
            return instance;
        }
        //链表头渲染,这里至少会有一个，不能是空容器
        this.headChild = getNext(0);
    }

    removeChild(child){
       const index =  this.children.indexOf(child);
       this.children.splice(index,1)
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

    isInside(child,x,y){
        const {rect,lineHeight,bbox} = child;
        const topY = bbox.y;
        const bottomY = bbox.y+bbox.height;
        const top2Y = topY + lineHeight;
        const bottom2Y = bottomY - lineHeight;
        const right = bbox.x + bbox.width;
        if(x>right||x<bbox.x||y>bottomY||y<topY){
            return false;
        }
        if(y<top2Y&&x<rect.x){
            return false
        }
        if(y>bottom2Y&&x>rect.endX){
            return false
        }
        return true;
    }

    getDis(child,x,y){
        let {rect,textHeights,bbox,lineHeight,fontSizeHeight} = child;
        if(this.isInside(child,x,y)){
            return  -1;
        }
        const rects = [];
        const startLine = this.lineHeight[child.startLineNum];
        const endLine = this.lineHeight[child.endLineNum];
        if(textHeights.length>1){
            rects.push({
                left:rect.x,
                right:bbox.x+bbox.width,
                top:startLine.topY,
                bottom:startLine.bottomY
            },{
                left:bbox.x,
                right:bbox.x+bbox.width,
                top:startLine.bottomY,
                bottom:endLine.topY
            },{
                left:bbox.x,
                right:rect.endX,
                top:endLine.topY,
                bottom:endLine.bottomY
            })
        }else{
            rects.push({
                left:bbox.x,
                right:rect.endX,
                top:startLine.topY,
                bottom:startLine.bottomY
            })
        }
        let minDis = Infinity;
        rects.forEach(item=>{
            let dis;
            if(y<=item.top){
                if(x<item.left){
                    dis = Math.sqrt(Math.pow(x-item.left,2)+Math.pow(y-item.top,2));
                }else if(x>item.right){
                    dis = Math.sqrt(Math.pow(x-item.right,2)+Math.pow(y-item.top,2));
                }else{
                    dis = item.top-y
                }
            }else if(y>=item.bottom){
                if(x<item.left){
                    dis = Math.sqrt(Math.pow(x-item.left,2)+Math.pow(y-item.bottom,2));
                }else if(x>item.right){
                    dis = Math.sqrt(Math.pow(x-item.right,2)+Math.pow(y-item.bottom,2));
                }else{
                    dis = y-item.bottom
                }
            }else if(x<=item.left){
                dis = item.left - x;
            }else{
                dis = x - item.right;
            }
            minDis = Math.min(minDis,dis);
        })
        return minDis;
    }

    findClosetChild(x,y){
        const {children} = this;
        const inHeightChildren = [];
        let min = Infinity;
        let minChild;
        // 先检索出在范围内的所有子元素
        for(let i =0;i<children.length;i++){
            const child = children[i];
            const minDis = this.getDis(child,x,y);
            if(minDis===-1){//内部直接返回
                return child;
            }
            if(minDis<min){
                min = minDis;
                minChild = child;
            }
        }
        return minChild;
    }

    // 根据上面的位置更新下面的
    update(){
        this.headChild.update();
    }

    afterUpdate(){
        this.bbox = this.dom.getBBox();
        this.rect = {
            ...this.globalPos,
            endX :this.globalPos.x+this.bbox.width,
            endY :this.globalPos.y+this.bbox.height
        };
        if(this.next){
            this.next.update();
        }
    }
}
export default P;