import Base from './Base';

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
        this.data = data.data;
        this.globalPos = globalPos;
        this.init();
    }

    init(){
        this.text = this.renderer.createElementNS('text');
        this.renderer.g.appendChild(this.text);
        this.text.classList.add('ore-p');
        this.update()
    }

    getPositionByIndex(index){
        const bbox = this.getBBox();
        const fontSize = this.style.fontSize||14;
        return {
            x:this.globalPos.x,
            y:this.globalPos.y - fontSize
        }
    }

    update(){
        this.text.textContent = this.data;
        const {measure} = this.page;
        const {fontSize=14,lineGap=6 } = this.style;
        //这里计算每个字的宽高然后进行记录和设置
        const strs = this.data.split('');
        let x = this.globalPos.x;
        let y = this.globalPos.y;
        let paths = [
            [x]
        ];
        let textHeights = [this.globalPos.y];
        let lineHeight = fontSize + (fontSize%2===0?lineGap:(lineGap-0.5));
        let lineNum = 0;
        let xStr = '';
        let yStr = '';
        strs.forEach((str,i)=>{
            // if(escape(str).indexOf("%u")===0){//汉字
            // }else{}
            let width = measure.measure(str);
            if((x+width)>this.renderer.width){
                x = this.globalPos.x;
                textHeights.push(y);
                y += lineHeight;
                lineNum++;
                paths[lineNum]=[];
                paths[lineNum].push(x);
                return;
            }
            x += width + this.textSpace;
            paths[lineNum].push(x);
        });
        paths.forEach((path,lineNum)=>{
            path.forEach(x=>{
                xStr += `${parseFloat(x.toFixed(2))} `;
                yStr += `${parseFloat(textHeights[lineNum].toFixed(2))} `;
            })
        }) 
        this.paths = paths;
        this.textHeights = textHeights;
        this.text.setAttribute('x',xStr);
        this.text.setAttribute('y',yStr);
    }
}
export default P;