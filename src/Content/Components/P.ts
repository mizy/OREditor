
interface Data{
    value:string,
    [propName:string]:any
}

// 一个回车一个段落，做为根组件，每次渲染时，下属所有子组件全部更新渲染
class P  {
    data:Data
    el:any
    constructor(data:Data){
        this.data = data;
        const el = document.createElement('div');
        el.className = 'p';
        el.innerHTML = '\&zwnj;';
        this.el = el;
        this.init();
    }

    init(){

    }

    getActiveNode(){
        return this.el.childNodes[0]
    }

    getBasePose(){
        return this.el.getBoundingClientRect();
    }

    // 接受 组件值变化
    accpet(val,start,end){
        // 普通情况
        const startStr = this.el.innerHTML.slice(0,start);
        const endStr = this.el.innerHTML.slice(end);
        this.el.innerHTML = `${startStr}${val}${endStr}`
        this.data.value = this.el.innerHTML;
    }

    backdelete(start,end){
        if(start<0){
            start = 0
        }
        if(end<0){
            end=0
        }
        const startStr = this.el.innerHTML.slice(0,start);
        const endStr = this.el.innerHTML.slice(end);
        this.el.innerHTML = `${startStr}${endStr}`
        this.data.value = this.el.innerHTML;
    }

    // 这里做局部刷新渲染
    update(){
        const {value} = this.data;
        this.el.innerHTML = value;
    }
}
export default P;
