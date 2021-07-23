
const getAllActions = (editor)=>{
    const {page} = editor;
    const {renderer,cursor,schema} = page;
    return {
        "DeleteChar":function(component){
            this.redo = ()=>{
                if(component.data.length===1){// 全部删除
                    this.data = component.getData();
                    component.destroy(); 
                    return;
                }
                this.str = component.spliceChar(component.index,1);
                renderer.activeComponent = component;
                cursor.relocate();
            };
            this.undo = ()=>{
                if(this.data){
                    component.init();
                    component.addTo();
                }
                component.spliceChar(component.index,0,this.str);
                renderer.activeComponent = component;
                cursor.relocate();
            }
            return this;
        },
    }
}
export default getAllActions;