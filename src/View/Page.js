
import Cursor from "./Cursor";
import Measure from '../Utils/Measure';
import Renderer from '../Components/Renderer';
const testData = [{
    type:"p",
    children:[{
        fontSize:24,
        type:"span",
        data:'我'
    },{
        fontSize:18,
        type:"span",
        data:'GraphQL 带来的最大好处是精简请求响应内容，不会出现冗余字段，前端可以textabc后端返回什么数据。但要注意的是，前端的决定权取决于后端支持什么数据，因此 GraphQL 更像是精简了返回值的 REST，而后端接口也可以一次性定义完所有功能，而不需要逐个开发。'
    }]
}];
let str = '';
let i = 10000;
while(i>0){
    str+='发'
    i--;
}
testData[0].children.push({
    fontSize:18,
    type:"span",
    data:str
})
class Page{
    constructor(editor){
        this.editor = editor;
        this.option = editor.option;
        this.init();
    }

    init(){
        this.initDOM();
        this.cursor = new Cursor(this);
        this.measure = new Measure(this);
        this.renderer = new Renderer(this);
        this.initData(testData);
    }

    initDOM(){
        this.container = document.createElement('div');
        this.container.classList.add("ore-container");
        this.editor.dom.append(this.container)
        this.dom = document.createElement('div');
        this.dom.classList.add("ore-page");
        this.dom.style.width  = this.option.width+'px';
        this.dom.style.height = this.option.height + 'px';
        this.container.appendChild(this.dom);
        this.svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
        this.svg.classList.add("ore-canvas");
        this.svg.setAttribute("width",this.option.width);
        this.dom.append(this.svg);
        this.svgDoc = this.svg.ownerDocument;
        this.addEvents();
    }


    initData(data){
        this.data = data;
        this.renderer.init();
        this.resize();
    }
 
    resize(){
        let {height} = this.renderer.g.getBBox();
        height += 2*this.option.padding.y;
        this.dom.style.height = height+'px';
        this.rect = this.dom.getBoundingClientRect();
        this.svg.setAttribute("height",height)
    }

    addEvents(){
    }
}
export default Page;