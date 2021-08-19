class Base{

    globalPos=undefined
    getBBox(){
        if(this.data===this.cacheData)return this.cacheBBox;
        this.cacheData = this.data;
        this.cacheBBox = this.dom.getBBox();
        return this.cacheBBox;
    }

    getPositionByIndex(index){
        return {
            x:this.globalPos.x,
            y:this.globalPos.y
        }
    }

    getPrev(){
        if(this.prev){
            return this.prev;
        }
        
        return false
    }

    //渲染当前行的头
    updateHead(){
        this.getStartLineHead().update();
    }

    // 获取当前行的头
    getStartLineHead(){
        let lineHead = this;
        while(lineHead.prev&&lineHead.prev.endLineNum===this.startLineNum){
            lineHead = lineHead.prev;
        };
        return lineHead;
    }

    splitChar(){

    }
    delete(){
        this.destroy();
    }

    destroy(){}

}
export default Base;