class Base{

    globalPos={
        x:0,
        y:0
    }
    getBBox(){
        if(this.data===this.cacheData)return this.cacheBBox;
        this.cacheData = this.data;
        this.cacheBBox = this.dom.getBBox();
        return this.cacheBBox;
    }

    getPositionByIndex(index){
        const bbox = this.getBBox();
        this.rect = bbox;
        return {
            x:this.globalPos.x,
            y:this.globalPos.y - bbox.height
        }
    }
}
export default Base;