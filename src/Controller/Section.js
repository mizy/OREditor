class Section{
    paths = [];
    constructor(page){
        this.page = page;
        this.renderer = page.renderer;
        this.initDOM();
    }

    initDOM(){
        this.path  = this.renderer.createElementNS("path");
        this.path.classList.add("section-fill");
        this.path.setAttribute("fill","url(#section-path)");
        this.path.setAttribute("filter","url(#section-filter)")
        this.renderer.g.appendChild(this.path);
        this.fillFilter = this.renderer.$(`<linearGradient id="section-path" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%" stop-color="rgba(180,180,250,.5)"/>
        <stop offset="50%" stop-color="rgba(75,150,250,.8)"/>
        <stop offset="100%" stop-color="rgba(75,150,250,1)"/>
      </linearGradient>`);
       this.filterSVG = this.renderer.$(`<filter id="section-filter" filterUnits="userSpaceOnUse"
       x="-5" y="-5"  width="400" height="200"> 
       <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>
       <feOffset in="blur" dx="0" dy="2" result="offsetBlur"/>
       <feSpecularLighting in="blur" surfaceScale="5" specularConstant=".75"
                           specularExponent="20" lighting-color="#bbbbbb"
                           result="specOut">
           <fePointLight x="-5000" y="-10000" z="20000"/>
       </feSpecularLighting>
       <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut"/>
       <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic"
                   k1="0" k2="1" k3="1" k4="0" result="litPaint"/>
       <feMerge>
           <feMergeNode in="offsetBlur"/>
           <feMergeNode in="litPaint"/>
       </feMerge>
       </filter>`);
        this.renderer.defs.append(this.fillFilter);
        this.renderer.defs.append(this.filterSVG);
    }

    startDrag(event){
        const pos = this.page.cursor.getGlobalXY(event);
        const {x,y} = this.renderer.findPosition(pos.x,pos.y);
        this.startPos = {
            component:this.renderer.activeComponent,
            index:this.renderer.activeComponent.index,
            nowLine:this.renderer.activeComponent.nowLine,
            x,
            y
        }
        this.page.cursor.hide();
        this.paths = [];
        this.update();
    }

    drag(event){
        const pos = this.page.cursor.getGlobalXY(event);
        const {x,y} = this.renderer.findPosition(pos.x,pos.y);
        const {nowLine,index} = this.renderer.activeComponent;
        this.dragPos= {
            component:this.renderer.activeComponent,
            index,
            nowLine,
            x,
            y
        }
        const startParent = this.startPos.component.parent;
        const endParent = this.dragPos.component.parent;
        //当前行
        if(this.dragPos.nowLine === this.startPos.nowLine){
            const topY = startParent.lineHeight[this.startPos.nowLine].topY;
            const bottomY = startParent.lineHeight[this.dragPos.nowLine].bottomY;
            this.paths = [ 
                {
                    x:this.startPos.x,
                    y:bottomY
                },
                {
                    x:this.startPos.x,
                    y:topY
                },
                {
                    x:this.dragPos.x,
                    y:topY
                },
                {
                    x:this.dragPos.x,
                    y:bottomY
                }
            ]
            //非当前行
        }else{
            let startPos = this.startPos.originY<this.dragPos.originY?this.startPos:this.dragPos;
            let dragPos = this.startPos.originY<this.dragPos.originY?this.dragPos:this.startPos;
            const firstTopY =   startParent.lineHeight[startPos.nowLine].topY;
            const firstBottomY =  startParent.lineHeight[startPos.nowLine].bottomY;
            const lastTopY =   endParent.lineHeight[dragPos.nowLine].topY;
            const lastBottomY =  endParent.lineHeight[dragPos.nowLine].bottomY;
            this.paths = [{
                x:startPos.component.parent.rect.x,
                y:firstBottomY
            },{
                x: startPos.x,
                y:firstBottomY
            },
            {
                x: startPos.x,
                y:firstTopY
            },{
                x: startPos.component.parent.rect.endX,
                y:firstTopY
            },{
                x: startPos.component.parent.rect.endX,
                y: lastTopY
            },{
                x: dragPos.x,
                y: lastTopY
            },{
                x: dragPos.x,
                y: lastBottomY
            },{
                x: startPos.component.parent.rect.x,
                y: lastBottomY
            }]

        }
        this.update();
    }

    endDrag(event){
         
    }

    hide(){
        this.paths = [];
        this.update();
    }

    update(){
        let str = '';
        if(this.paths.length<2){
            this.path.setAttribute("d",str);
            return;
        }
        let minX = 0;
        let maxX = 0;
        let minY = 0;
        let maxY = 0;
        this.paths.forEach((each,index)=>{
            minX = Math.min(minX,each.x);
            maxX = Math.max(maxX,each.x);
            minY = Math.min(minY,each.y);
            maxY = Math.max(maxY,each.y);
            if(index===0){
                str += `M ${each.x} ${each.y} `
            }else if(index<this.paths.length){
                str += `L ${each.x} ${each.y} `
            }
        })
        str += 'Z';
        this.filterSVG.setAttribute("width",maxX - minX + 10);
        this.filterSVG.setAttribute("height",maxY - minY + 10);
        this.path.setAttribute("d",str);
    }
}
export default Section;