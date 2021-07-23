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
        if(this.parent.prev){
            return this.parent.prev.children[0]
        }
        return false
    }

    splitChar(){

    }
    delete(){
        this.destroy();
    }

    destroy(){}

}
export default Base;