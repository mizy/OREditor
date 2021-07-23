
const getAllCommands = (editor,actions)=>{
    const {page} = editor;
    const {renderer,cursor,schema} = page;
    const isValid = ()=>{
         
        return true;
    }
    return [
        {
            name:"Delete",
            keys:[{ key:'Backspace', altKey: false, ctrlKey: false, shiftKey: false }],
            execute : function(){
                let component =  renderer.activeComponent;
                if(component.index===0){
                    const prev = component.getPrev();
                    if(!prev){
                        return false//头组件，无前无后就不能删了
                    }// 删除到前一个组件
                    prev.spliceChar(prev.data.length-1,1);
                }else{
                    // 最后一个直接删除组件
                    component.spliceChar(component.index-1,1);
                }
                cursor.relocate();
            },
            isValid
        }, 
    ]
}
export default getAllCommands;