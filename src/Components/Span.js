import Base from './Base';

/**
 * @class
 */
class Span extends Base{
    name="Span";
    nowLine=0;//当前span获取焦点的行
    indexMap={}
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
            lineSpace:10,
            textSpace:0,
            fontWeight:'normal',
            fontStyle:'unset'
        },data.style);
        this.data = data.data;
        this.initFontHeight();
        this.initDOM();
    } 
    
    initFontHeight(){
        const {fontSize=14} = this.style;
        const textMatric =  this.page.measure.getSizeHeight(fontSize)
        this.lineHeight = textMatric.fontBoundingBoxAscent + textMatric.fontBoundingBoxDescent + this.style.lineSpace;
        this.fontSizeHeight = textMatric.fontBoundingBoxAscent;
        this.disY = this.style.lineSpace/2;
    }

    initDOM(){
        this.dom = this.renderer.createElementNS('text');
        this.parent.dom.appendChild(this.dom);
        this.dom.classList.add('ore-span');
        this.updateStyle();
    }

    updateStyle(){
        const {color,fontSize,fontWeight,fontStyle} = this.style;
        this.dom.style.fill = color;
        this.dom.style.fontSize = fontSize;
        this.dom.style.fontWeight = fontWeight;
        this.dom.style.fontStyle = fontStyle;
        // this.dom.setAttribute("font-size",this.style.fontSize);
        // this.dom.setAttribute("fill",this.style.color||'');
    }

    //获取指定索引字符的起始位置
    getPositionByIndex(index=this.index){
        // 若该组件已经没有任何字符串时，位置取根位置
        let pos = this.indexMap[index]||{
            x:this.globalPos.x,
            y:this.globalPos.y - this.fontSizeHeight
        };
        
        return {
            x:pos.x,
            y:pos.y - this.fontSizeHeight - this.disY,
            originY:pos.y,
            height:this.lineHeight,
            component:this,
            textHeight:this.fontSizeHeight
        };
    }

    /**
     * 定位并且记录下当前的行数和指针位置
     * @param {number} x 
     * @param {number} y 
     * @returns 
     */
    findPosition(x,y){
        const {paths,textHeights} = this;
        this.index = 0;
        for(let i =0 ;i<textHeights.length;i++){
            const bottomY = this.parent.lineHeight[this.startLineNum+i].bottomY;
            //y在组件上方，或者到最后都没有
            if(y<bottomY||i===textHeights.length-1){
                let finalX,beforeX,j=0;
                // 查找前一个坐标和后一个坐标
                for(j = 0;j<paths[i].length;j++){
                    let coord = paths[i][j]
                    if(coord>x){
                        finalX = coord;
                        beforeX = paths[i][j-1];
                        break;
                    }
                };
                if(finalX===undefined){//没有末尾坐标,说明是结尾，要构建前一个坐标和当前坐标
                    beforeX = paths[i][j-1];
                    finalX = paths[i].slice(-1)[0] + this.getFontWidth(this.data[this.index + j - 1])
                }
                // 前一个坐标存在则判断中点来定位指针是否-1
                if(beforeX!==undefined){
                    const middle = (beforeX+finalX)/2;
                    if(x<middle||beforeX===finalX){
                        finalX = beforeX;
                        j--;
                    }
                }
                this.index += j;
                this.nowLine = this.startLineNum+i;
                const finalY = textHeights[i]  - this.fontSizeHeight - this.disY ;
            
                return {
                    x:finalX,
                    y:finalY,
                    height:this.lineHeight,
                    component:this
                }
            }
            this.index += paths[i].length;
        }
        this.nowLine = this.endLineNum;
        return {
            x:paths[0][0],
            y:textHeights[0] - this.fontSizeHeight ,
            height:this.lineHeight,
            component:this
        }
    }

    /**
     * 重新计算当前组件左上角的绝对坐标，和当前行的坐标如果么有前置组件，则为父组件的坐标+字高
     */
    calcGlobalPos(){
        let globalPos;
        
           // 有前置的情况
        if(this.prev){
            const {fontSize,textSpace} = this.style;
            const {rect} = this.prev;
            let lineNum = this.prev.endLineNum;
            const highComponent = this.parent.lineHeight[lineNum]?.component;
            //这里取前置的当前行最大组件
            const prevSize = highComponent.style.fontSize;
            globalPos = {x:rect.endX,y:rect.endY};
            const firstStrWidth = this.getFontWidth(this.data[0]); 
            // 要换行的情况
            if(globalPos.x + firstStrWidth>this.parent.rightGap){
                lineNum++;
                globalPos = {x:this.parent.rect.x,y:rect.endY+this.lineHeight};
                this.parent.lineHeight[lineNum] = {
                    component:this,
                    topY:globalPos.y - this.fontSizeHeight - this.disY,
                    bottomY:globalPos.y - this.fontSizeHeight - this.disY + this.lineHeight
                };
            }else if(fontSize>prevSize){//不换行的情况
                let topY = this.parent.lineHeight[lineNum].topY;
                let beforeY = globalPos.y;
                globalPos.y  = topY + this.disY + this.fontSizeHeight;
                this.prev.onLineFontSizeChange(beforeY,globalPos.y,this);
                 // 更改记录当前行的最大高度
                this.parent.lineHeight[lineNum] = {
                    component:this,
                    topY,
                    bottomY:topY + this.lineHeight 
                };
            }
            this.startLineNum = lineNum;
            globalPos.x += textSpace;
        }else{// 无前置的情况坐标要从parent取
            globalPos = {...this.parent.globalPos};
            globalPos.y += this.disY + this.fontSizeHeight;
            // 第一行
            this.parent.lineHeight[0] = {
                component:this,
                topY:this.parent.globalPos.y,
                bottomY:this.parent.globalPos.y + this.lineHeight
            };
            this.startLineNum = 0;
        }
        this.globalPos = globalPos;
        
    } 

    getFontWidth(str){
        if(str===undefined)return 0;
        let width = this.style.fontSize;
        if(escape(str).startsWith("%u")){//汉字时，重置字符串状态
        }else if(str===' '){//空格也要重新计算英文
            width *= 0.5;
        } else{//字母第一次换行不能截断
            width = this.page.measure.measure(str,this.style.fontSize);
        }
        return width
    }

    addData(data){
        this.data += data;
    }

    /**
     * 更新路径
     * @param {boolean} 是否是链式渲染下来的
     */
    update(flag=true){
        if(flag)
        this.calcGlobalPos();

        const {measure,option:{padding}} = this.page;
        const {fontSize=14,textSpace} = this.style;
        const rightGap = this.parent.rightGap;
       
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
                // 这里应该是取当前行最大组件的行高
                if(textHeights.length===1){
                    y = this.parent.lineHeight[this.startLineNum].bottomY + this.disY + this.fontSizeHeight;
                }else{
                    y += this.lineHeight ;
                }
                textHeights.push(y);
                if(chars.length&&!hasWrapped){//英文没换过行则需要出栈队列里的所有字母
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
        this.endLineNum = this.startLineNum + textHeights.length - 1;
        this.paths = paths;
        this.textHeights = textHeights;
        this.updateParentLineHeight();
        this.updatePaths();
        // 链式渲染
        if(this.next){
            this.next.update(true);
        }else{
            this.parent.lineHeight.splice(this.endLineNum+1,1)
            this.parent.afterUpdate()
        }
    }

    updateParentLineHeight(){
        for(let i = 1;i<this.textHeights.length;i++){
            this.parent.lineHeight[this.startLineNum+i] = {
                component:this,
                topY:this.textHeights[i] - this.fontSizeHeight - this.disY,
                bottomY:this.textHeights[i] - this.fontSizeHeight - this.disY + this.lineHeight,
            }
        }
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
            path.forEach((x,index)=>{
                this.indexMap[i] = {
                    x,
                    y:this.textHeights[lineNum]
                };
                // ||index===path.length-1 不用把最后一个坐标去掉吧
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
        this.dom.textContent = this.renderStr;
        this.dom.setAttribute('x',xStr);
        this.dom.setAttribute('y',yStr);
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
        if(this.textHeights.length===1){
            rect.y = rect.endY;
        }
        this.bbox = this.dom.getBBox();
        return rect;
    }

    // 当前行的文字大小改变时，最后一行的Y坐标也要相应改变
    onLineFontSizeChange(beforeY,nowY){
        const lastY  = this.textHeights[this.textHeights.length-1]
        if(lastY>=beforeY){
            this.textHeights[this.textHeights.length-1] = nowY;
            if(this.textHeights.length===1){//只有一行的情况，组件的全局坐标也给他改咯
                this.globalPos.y = nowY;
            }
            this.updatePaths();
            if(this.prev){
                this.prev.onLineFontSizeChange(beforeY,nowY)
            }
        }
        
    }

    /**
     * 删除指定长度的文字，且返回被删除的文字
     * @param {number} index 
     * @param {number} number 
     * @returns 
     */
     spliceChar(index,number,str=""){
         if(index===0&&number>=this.data.length&&!str){
             const oldStr = this.data;
            this.destroy();
            return oldStr;
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

   

    //清空
    clear(){
        this.dom.remove();
        for(let key in this){
            this[key] = undefined;
        }
        this.cleared = true
    }

    destroy(isRender=true){
        // 简单粗暴不进行最优渲染，直接渲染当前段落，后续可以优化为值渲染当前行
        this.parent.removeChild(this);
        this.parent.lineHeight = [];
        if(isRender){
            this.parent.headChild.update();
        }
        this.clear();
    }

    toJSON(index){
        return {
            type:"span",
            style:{
                ...this.style
            },
            data:this.data
        }
    }
}
export default Span;