import Base from './Base';

/**
 * @class
 */
class Span extends Base{
    constructor({data,parent,globalPos}){
        super();
        this.parent = parent;
        this.renderer = parent.renderer;
        this.page = this.renderer.page;
        this.style = Object.assign({
            fontSize:14,
            lineSpace:0,
            textSpace:1
        },data.style);
        this.data = data.data;
        const {fontSize=14,textSpace} = this.style;

        this.lineHeight = this.page.measure.getBBoxHeight(fontSize);
        this.fontSizeHeight = this.page.measure.getSizeHeight(fontSize);
        this.disY = (this.lineHeight - fontSize)/2;
        if(!globalPos){
            globalPos = {...this.parent.globalPos};
            globalPos.y +=  this.fontSizeHeight;
        }else{
            globalPos.x += textSpace
        }
        this.globalPos = globalPos;
        this.init();
    }

    init(){
        this.text = this.renderer.createElementNS('text');
        this.parent.dom.appendChild(this.text);
        this.text.classList.add('ore-span');
        this.update()
    }

    getPositionByIndex(index){
        const pos = this.indexMap[index];
        return {
            ...pos,
            height:this.lineHeight,
            textHeight:this.fontSizeHeight
        };
    }

    findPosition(x,y){
        const {paths,textHeights} = this;
        this.index = 0;
        for(let i =0 ;i<textHeights.length;i++){
            if(y<textHeights[i]){
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
                this.index += j;
                const finalY = textHeights[i]  - this.fontSizeHeight;
                return {
                    x:finalX,
                    y:finalY,
                    height:this.lineHeight
                }
            }
            this.index += paths[i].length;
        }
        return {
            x:paths[0][0],
            y:textHeights[0] - this.fontSizeHeight,
            height:this.lineHeight,
        }
        // if(y<rect.top||y>rect.bottom)
    }

    update(){
        this.indexMap = {};
        this.text.textContent = this.data;
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
        let xStr = '';
        let yStr = '';
        const strs = this.data.split('');
        let chars = [];
        let hasWrapped = false;//标识当前字母串是否已经换过行
        strs.forEach((str,i)=>{
            this.indexMap[i] = {
                x,
                y:textHeights[textHeights.length-1]
            };
            let width = fontSize;
            if(escape(str).startsWith("%u")){//汉字时，重置字符串状态
                chars = [];
                hasWrapped = false;
            }else if(str===' '){//空格也要重新计算英文
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
        paths.forEach((path,lineNum)=>{
            // path.pop();
            path.forEach(x=>{
                xStr += `${parseFloat(x.toFixed(2))} `;
                yStr += `${parseFloat(textHeights[lineNum].toFixed(2))} `;
            })
        }); 
        this.paths = paths;
        this.textHeights = textHeights;
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
}
export default Span;