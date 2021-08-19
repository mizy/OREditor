export default function SetStyle(style,page,renderer){
    let {section} = page;
    if(section.paths.length){
        const {selections,startPos,endPos} = section.getSelections();
        const startComponent = selections[0];
        const endComponent = selections[selections.length - 1];
        if(startComponent===endComponent){
            startComponent.spliceChar(startPos.index,endPos.index-startPos.index)
        }else{
            startComponent.spliceChar(startPos.index,startComponent.data.length-startPos.index);
            endComponent.spliceChar(0,endPos.index);
            for(let i = 1;i<selections.length-1;i++){
                selections[i].destroy(false);
            }
            startComponent.parent.update();
        }
        startComponent.index = startPos.index;
        renderer.activeComponent = startComponent;
        section.hide();
        cursor.show();
        return cursor.relocate();
    }else{
        page.cursor.setStyle({color:'red'});
    }
}