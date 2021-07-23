import Base from './Base';

/**
 * @class
 */
class Span extends Base{
    //tips: 尽量不要再初始化的过程中进行数据相关操作，否则类的操控会太过自动化，难以操控，尽量保持专职专能
    constructor({data,parent,prev,next}){
        super();
        this.parent = parent;
        this.renderer = parent.renderer;
        this.page = this.renderer.page;
        this.prev = prev;//单向链表
        this.next = next;//双向链表
        this.style = Object.assign({
            fontSize:14,
            lineSpace:5,
            textSpace:0
        },data.style);
        this.data = data.data;
        const {fontSize=14} = this.style;

        this.lineHeight = this.page.measure.getBBoxHeight(fontSize);
        this.fontSizeHeight = this.page.measure.getSizeHeight(fontSize);
        this.disY = (this.lineHeight - fontSize)/2;
        this.initDOM();
    } 

    initDOM(){
        this.text = this.renderer.createElementNS('text');
        this.parent.dom.appendChild(this.text);
        this.text.setAttribute("font-size",this.style.fontSize)
        this.text.classList.add('ore-span');
    }

    getPositionByIndex(index){
        // 若该组件已经没有任何字符串时，位置取根位置
        let pos = this.indexMap[index]||{
            x:this.globalPos.x,
            y:this.globalPos.y - this.fontSizeHeight
        };
        
        return {
            x:pos.x,
            y:pos.y- this.fontSizeHeight,
            height:this.lineHeight,
            component:this,
            textHeight:this.fontSizeHeight
        };
    }

    findPosition(x,y){
        const {paths,textHeights} = this;
        this.index = 0;
        for(let i =0 ;i<textHeights.length;i++){
            //y在组件上方，或者到最后都没有
            if(y<textHeights[i]||i===textHeights.length-1){
                let finalX,beforeX,j=0;
                for(j = 0;j<paths[i].length;j++){
                    let coord = paths[i][j]
                    if(coord>x){
                        finalX = coord;
                        beforeX = paths[i][j-1];
                        break;
                    }
                };
                if(beforeX!==undefined){
                    const middle = (beforeX+finalX)/2;
                    if(x<middle){
                        finalX = beforeX;
                        j--;
                    }
                }
                if(j>-1)this.index += j;
                const finalY = textHeights[i]  - this.fontSizeHeight;
                if(finalX===undefined){//没有finalX说明在组件的右上方
                    finalX = paths[i].slice(-1)[0] + this.getFontWidth(this.data[this.index])
                }
                return {
                    x:finalX,
                    y:finalY,
                    height:this.lineHeight,
                    component:this
                }
            }
            this.index += paths[i].length;
        }
        
        return {
            x:paths[0][0],
            y:textHeights[0] - this.fontSizeHeight,
            height:this.lineHeight,
            component:this
        }
    }

    /**
     * 重新计算当前组件左上角的绝对坐标，如果么有前置组件，则为父组件的坐标+字高
     */
    calcGlobalPos(){
        let globalPos;
           // 有前置的情况
        if(this.prev){
            const {fontSize,textSpace} = this.style;
            const {rect} = this.prev;
            const prevSize = this.prev.style.fontSize;
            globalPos = {x:rect.endX,y:rect.endY};      
             // 字高毕竟大撑开当前行
            if(fontSize>prevSize){
                let beforeY = globalPos.y;
                globalPos.y  += this.fontSizeHeight - this.prev.fontSizeHeight;
                this.prev.onLineFontSizeChange(beforeY,globalPos.y)
            }
            globalPos.x += textSpace;
        }else{// 无前置的情况坐标要从parent取
            globalPos = {...this.parent.globalPos};
            globalPos.y +=  this.fontSizeHeight;
        }
        this.globalPos = globalPos
    } 

    getFontWidth(str){
        let width = this.style.fontSize;
        if(escape(str).startsWith("%u")){//汉字时，重置字符串状态
        }else if(str===' '){//空格也要重新计算英文
            width *= 0.5;
        } else{//字母第一次换行不能截断
            width = this.page.measure.measure(str,this.style.fontSize);
        }
        return width
    }

    /**
     * 更新路径
     * @param {boolean} 是否是链式渲染下来的
     */
    update(flag=true){
        if(flag)
        this.calcGlobalPos();

        const {measure,option:{padding}} = this.page;
        const {fontSize=14,textSpace,lineSpace} = this.style;
        const rightGap = this.renderer.width;
       
        //该组件每行高度
        // 字高，用来向上偏移
        let {x,y} = this.globalPos; 
        // x坐标数组
        let paths = [
            [x]
        ];
        // 每行y坐标数组
        let textHeights = [y];
        
        let lineNum = 0;
        
        const strs = this.data.split('');
        let chars = [];
        let hasWrapped = false;//标识当前字母串是否已经换过行
        strs.forEach((str,i)=>{
            let width = fontSize;
            if(escape(str).startsWith("%u")){//汉字时，重置字符串状态
                chars = [];
                hasWrapped = false;
            }else if(str===' '){//空格不放到paths里
                chars = [];
                width *= 0.5;
                hasWrapped = false;
            } else{//字母第一次换行不能截断
                width = measure.measure(str,fontSize);
                chars.push(str);
            }
            x += width + textSpace;
            if(x>rightGap){
                x = 0;
                y += this.lineHeight+lineSpace;
                textHeights.push(y);
                if(chars.length&&!hasWrapped){//英文没换过行则需要出栈队列里的所有字母
                    hasWrapped = true;
                    const beforePos = paths[lineNum].splice(paths[lineNum].length - chars.length,chars.length);
                    const firstPos = beforePos[0];
                    lineNum++;
                    paths[lineNum]=[];
                    beforePos.forEach(each=>{
                        paths[lineNum].push(each - firstPos);
                    })
                    x = paths[lineNum].slice(-1)[0]+width+textSpace;//获取最后一个单词的为值，为下一个做准备
                    hasWrapped = true;//标识已经换过行,下次换行时走正常逻辑
                }else{//中文或已经换过行只需要出栈一次
                    paths[lineNum].pop();//上一个字符出栈
                    lineNum++;
                    paths[lineNum]=[];
                    paths[lineNum].push(x);
                    x = width+textSpace;
                }
            }
            paths[lineNum].push(x);
        });
        this.paths = paths;
        this.textHeights = textHeights;
        this.updatePaths();
        // 链式渲染
        this.next&&this.next.update(true);
    }

    updatePaths(){
        this.indexMap = {}
        let i = 0;
        let xStr = '',yStr = '';
        /**
         * @param {String} 当前渲染的字符串(不包含空格)
         */
        this.renderStr = '';
        this.paths.forEach((path,lineNum)=>{
            // path.pop();
            path.forEach(x=>{
                this.indexMap[i] = {
                    x,
                    y:this.textHeights[lineNum]
                };
                if(this.data[i] ===' '){
                    i++;
                    return false;//空格跳过
                }   
                this.renderStr += this.data[i]||"";
                i++;
                xStr += `${parseFloat(x.toFixed(2))} `;
                yStr += `${parseFloat(this.textHeights[lineNum].toFixed(2))} `;
            })
        }); 
        this.text.textContent = this.renderStr;
        this.text.setAttribute('x',xStr);
        this.text.setAttribute('y',yStr);
        this.getBBox();
    }
 
    getBBox(){
        const rect = {
            x:this.globalPos.x,
            y:this.globalPos.y,
        };
        this.rect = rect;
        rect.endX = this.paths.slice(-1)[0].slice(-1)[0];
        rect.endY = this.textHeights.slice(-1)[0];
        this.bbox = this.text.getBBox();
        return rect;
    }

    // 当前行的文字大小改变时，最后一行的Y坐标也要相应改变
    onLineFontSizeChange(beforeY,nowY){
        const lastY  = this.textHeights[this.textHeights.length-1]
        if(lastY>=beforeY){
            this.textHeights[this.textHeights.length-1] = nowY;
        }
        this.updatePaths();
        if(this.prev){
            this.prev.onLineFontSizeChange(beforeY,nowY)
        }
    }

    /**
     * 删除指定长度的文字，且返回被删除的文字
     * @param {number} index 
     * @param {number} number 
     * @returns 
     */
     spliceChar(index,number,str=""){
         if(this.data.length===1&&number!==0){
            this.destroy();
            return true;
         }
        //新增情况
        if(number===0){
            this.data = this.data.substring(0, index) + str + this.data.substring(index + number);
            this.index = index + str.length;
            this.update(false);
            return str;
        } 
        const oldStr =  this.data.substr(index, number);
        this.data = this.data.substring(0,index) + str + this.data.substring(index + number);
        // 更新当前指针
        this.index = Math.max(index, 0);
        this.update(false);
        return oldStr;
    }

    destroy(){
        //cursor重指向
        if(this.renderer.activeComponent){
            if(this.prev){
                this.renderer.activeComponent = this.prev;
                this.prev.index = this.prev.data.length;
            }else if(this.next){
                this.renderer.activeComponent = this.next;
                this.next.index = 0;
            }else{
                return false;
            }
        }
        
        // 链表重连
        if(this.prev){
            this.prev.next = this.next;
        }
        if(this.next){
            this.next.prev = this.prev;
        }
        this.text.remove();
        this.next.update();
        this.parent.removeChild(this)
        for(let key in this){
            this[key] = undefined;
        }
    }
}
export default Span;