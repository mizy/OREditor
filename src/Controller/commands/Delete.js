export default function Delete(page,renderer){
    let component =  renderer.activeComponent;
    let {section,cursor} = page;
    // 有选中一大片时
    if(section.paths.length){
        const {selections,startPos,endPos} = section.getSelections();
        let startComponent = selections[0];
        const endComponent = selections[selections.length - 1];
        const startParent = startComponent.parent;
        const endParent = endComponent.parent;
        if(startComponent===endComponent){
            startComponent.spliceChar(startPos.index,endPos.index-startPos.index)
        }else{
            startComponent.spliceChar(startPos.index,startComponent.data.length-startPos.index);
            endComponent.spliceChar(0,endPos.index);
            for(let i = 1;i<selections.length-1;i++){
                selections[i].destroy(false);
            };
            if(startParent!==endParent){//父元素不同时，需要把end的元素也添加到start的父容器里
                const endJSON = endParent.toJSON();
                endParent.destroy();
                startParent.addChildrenData(endJSON.children);
            }else{
                startParent.update(true);
            }
        }
        //首元素被删除
        if(startComponent.cleared){
            renderer.activeComponent = startParent.children[0];
            renderer.activeComponent.index = 0;
            renderer.activeComponent.nowLine = 0;
        }else{
            startComponent.index = startPos.index;
            renderer.activeComponent = startComponent;
        }
        //检查是否合并
        renderer.checkComposite(renderer.activeComponent);
        section.hide();
        cursor.show();
        return cursor.relocate();
    }
    const {parent} = component;
    // 当是组件头时
    if(component.index===0){
        const prev = component.getPrev();
        if(!prev){
            //头组件，无前无后就不能删了
            if(!parent.prev){
                return false;
            };
            const prevParent = parent.prev;
            const json = parent.toJSON();
            const prevJSON = prevParent.toJSON();
            const prevIndex = prevJSON.children.length;
            parent.destroy();
            prevParent.addChildrenData(json.children);
            renderer.activeComponent = prevParent.children[prevIndex];
            renderer.activeComponent.index = 0;
            renderer.activeComponent.nowLine = renderer.activeComponent.startLineNum;
            cursor.relocate();
            return true;
        };
        // 删除到前一个组件
        renderer.activeComponent = prev;
        prev.index = prev.data.length-1;
    } 
    component.spliceChar(component.index-1,1);
    cursor.relocate();
}