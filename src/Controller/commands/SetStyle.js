export default function SetStyle(style,page,renderer){
    let {section,cursor} = page;
    if(section.paths.length){
        const {selections,startPos,endPos} = section.getSelections();
        let startComponent = selections[0];
        const endComponent = selections[selections.length - 1];
        const startParent = startComponent.parent;
        const endParent = endComponent.parent;
        const startStyle = {...startComponent.style};
        const endStyle = {...endComponent.style};
        let startIndex;
        if(startComponent===endComponent){
            const beforeData = startComponent.data.substring(0,startPos.index);
            const middleData = startComponent.data.substring(startPos.index,endPos.index);
            const lastData =  startComponent.data.substring(endPos.index);
            startIndex = startParent.children.indexOf(startComponent);
            startComponent.destroy(false);
            if(beforeData){
                startParent.insertSpan(startIndex,{
                    type:"span",
                    style:{
                        ...startStyle
                    },
                    data:beforeData
                });
                startIndex++;
            }
            if(middleData){
                let now = startParent.insertSpan(startIndex,{
                    type:"span",
                    style:{
                        ...startStyle,
                        ...style
                    },
                    data:middleData
                });
                startIndex++;
                renderer.activeComponent = now;
                renderer.activeComponent.index = middleData.length;
            }
            if(lastData){
                startParent.insertSpan(startIndex,{
                    type:"span",
                    style:{
                        ...startStyle,
                    },
                    data:lastData
                });
                startIndex++;
            }
            startParent.update(true);
        }else{
            const startData = startComponent.spliceChar(startPos.index,startComponent.data.length-startPos.index);
            startIndex = startParent.children.indexOf(startComponent);
            let first ;
            // 如果开头有数据才插入
            if(startData){
                first = startParent.insertSpan(startIndex+1,{
                    type:"span",
                    style:{
                        ...startStyle,
                        ...style
                    },
                    data:startData
                });
                startParent.update(true);
            }
            // 如果结尾有数据才插入
            const endIndex = endParent.children.indexOf(endComponent);
            const endData = endComponent.spliceChar(0,endPos.index);
            if(endData){
                // 组件可能被销毁,
                endParent.insertSpan(endIndex,{
                    type:"span",
                    style:{
                        ...endStyle,
                        ...style
                    },
                    data:endData
                });
                endParent.update(true);
            }
            // 中间的所有组件改变样式
            for(let i = 1;i<selections.length-1;i++){
                const item =  selections[i];
                if(item.name==="P"&&item.children){
                    item.children.forEach(item=>{
                        Object.assign(item.style,style);
                        item.updateStyle();
                    })
                }else{
                    Object.assign(item.style,style);
                    item.updateStyle();
                }
            };
            if(startComponent.cleared){
                renderer.activeComponent = first;
                first.index = 0;
            }else{
                renderer.activeComponent = startComponent;
                startComponent.index = startPos.index;
            }

        }
        
        section.hide();
        cursor.show();
        return cursor.relocate();
    }else{
        page.cursor.setStyle({color:'red'});
    }
}