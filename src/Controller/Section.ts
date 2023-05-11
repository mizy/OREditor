import { Page } from '..';
import P from '../Components/P';
import Renderer from '../Components/Renderer';
import Span from '../Components/Span';

class Section {
  paths = [];
  path: SVGPathElement;
  filterSVG: SVGFilterElement;
  startPos: {
    component: Span
    index: number
    focusLine: number
    x: number
    y: number
  };
  dragPos: {
    component: Span,
    index: number,
    focusLine: number,
    x: number,
    y: number
  };
  renderer: Renderer;
  fillFilter: SVGFilterElement;
  page: Page;
  constructor(page) {
    this.page = page;
    this.renderer = page.renderer;
    this.initDOM();
  }

  initDOM() {
    this.path = this.renderer.createElementNS("path") as SVGPathElement;
    this.path.classList.add("section-fill");
    // this.path.setAttribute("fill", "url(#section-path)");
    // this.path.setAttribute("filter", "url(#section-filter)")
    this.renderer.g.appendChild(this.path);
    this.fillFilter = this.renderer.$(`<linearGradient id="section-path" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%" stop-color="rgba(180,180,250,.5)"/>
        <stop offset="50%" stop-color="rgba(75,150,250,.8)"/>
        <stop offset="100%" stop-color="rgba(75,150,250,1)"/>
      </linearGradient>`) as SVGFilterElement;
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
       </filter>`) as SVGFilterElement;
    this.renderer.defs.append(this.fillFilter);
    this.renderer.defs.append(this.filterSVG);
  }

  startDrag(event) {
    const pos = this.page.cursor.getGlobalXY(event);
    const { x, y } = this.renderer.locateByGlobalPos(pos.x, pos.y);
    this.startPos = {
      component: this.renderer.activeComponent,
      index: this.renderer.activeComponent.index,
      focusLine: this.renderer.activeComponent.focusLine,
      x,
      y
    }
    this.page.cursor.hide();
    this.paths = [];
    this.update();
  }

  drag(event) {
    const pos = this.page.cursor.getGlobalXY(event);
    const { x, y } = this.renderer.locateByGlobalPos(pos.x, pos.y);
    const { focusLine, index } = this.renderer.activeComponent;
    this.dragPos = {
      component: this.renderer.activeComponent,
      index,
      focusLine,
      x,
      y
    }
    this.updatePaths();
    this.update();
  }

  updatePaths() {
    let startParent = this.startPos.component.parent;
    let endParent = this.dragPos.component.parent;
    if (this.dragPos.x === this.startPos.x && this.startPos.focusLine === this.dragPos.focusLine && startParent === endParent) {
      this.paths = [];
      return this.update();
    }
    //当前行
    if (this.dragPos.focusLine === this.startPos.focusLine && startParent === endParent) {
      const topY = startParent.lineHeight[this.startPos.focusLine].top + startParent.globalPos.y;
      const bottomY = startParent.lineHeight[this.dragPos.focusLine].bottom + startParent.globalPos.y;
      this.paths = [
        {
          x: this.startPos.x,
          y: bottomY
        },
        {
          x: this.startPos.x,
          y: topY
        },
        {
          x: this.dragPos.x,
          y: topY
        },
        {
          x: this.dragPos.x,
          y: bottomY
        }
      ]
      //非当前行
    } else {
      let startPos = this.startPos.y <= this.dragPos.y ? this.startPos : this.dragPos;
      let dragPos = this.startPos.y <= this.dragPos.y ? this.dragPos : this.startPos;
      if (this.dragPos.x < this.startPos.x) {
        startPos = this.dragPos;
        dragPos = this.startPos
      }

      startParent = startPos.component.parent;
      endParent = dragPos.component.parent;
      const firstTopY = startParent.lineHeight[startPos.focusLine].top + startParent.globalPos.y;
      const firstBottomY = startParent.lineHeight[startPos.focusLine].bottom + startParent.globalPos.y;
      const lastTopY = endParent.lineHeight[dragPos.focusLine].top + endParent.globalPos.y;
      const lastBottomY = endParent.lineHeight[dragPos.focusLine].bottom + endParent.globalPos.y;
      const right = Math.max(startPos.component.parent.rect.endX, dragPos.component.parent.rect.endX)
      this.paths = [{
        x: startPos.component.parent.rect.x,
        y: firstBottomY
      }, {
        x: startPos.x,
        y: firstBottomY
      },
      {
        x: startPos.x,
        y: firstTopY
      }, {
        x: right,
        y: firstTopY
      }, {
        x: right,
        y: lastTopY
      }, {
        x: dragPos.x,
        y: lastTopY
      }, {
        x: dragPos.x,
        y: lastBottomY
      }, {
        x: startPos.component.parent.rect.x,
        y: lastBottomY
      }]

    }
  }

  getSelections() {
    let startPos = this.startPos.y <= this.dragPos.y ? this.startPos : this.dragPos;
    let dragPos = this.startPos.y <= this.dragPos.y ? this.dragPos : this.startPos;
    if (startPos.component.parent === dragPos.component.parent && startPos.focusLine === dragPos.focusLine && dragPos.x < startPos.x) {
      let temp = startPos;
      startPos = dragPos;
      dragPos = temp;
    }
    const startComponent = startPos.component;
    const endComponent = dragPos.component;
    let startP = startComponent.parent;
    let endP = endComponent.parent;
    let res: (Span | P)[] = [];
    let nowComponent = startComponent;
    while (nowComponent && nowComponent !== endComponent) {
      res.push(nowComponent);
      nowComponent = nowComponent.next;
    }
    if (startP !== endP) {
      let nowP = startP.next;
      while (nowP && nowP !== endP) {
        res.push(nowP);
        nowP = nowP.next;
      }
    }
    if (startP !== endP) {
      nowComponent = endP.headChild;
      while (nowComponent && nowComponent !== endComponent) {
        res.push(nowComponent);
        nowComponent = nowComponent.next
      }
    }
    res.push(endComponent);
    return {
      selections: res,
      startPos: startPos,
      endPos: dragPos
    }
  }

  endDrag(event) {

  }

  hide() {
    this.paths = [];
    this.update();
  }

  update() {
    let str = '';
    if (this.paths.length < 2) {
      this.path.setAttribute("d", str);
      return;
    }
    let minX = 0;
    let maxX = 0;
    let minY = 0;
    let maxY = 0;
    this.paths.forEach((each, index) => {
      minX = Math.min(minX, each.x);
      maxX = Math.max(maxX, each.x);
      minY = Math.min(minY, each.y);
      maxY = Math.max(maxY, each.y);
      if (index === 0) {
        str += `M ${each.x} ${each.y} `
      } else if (index < this.paths.length) {
        str += `L ${each.x} ${each.y} `
      }
    })
    str += 'Z';
    this.filterSVG.setAttribute("width", maxX - minX + 10 + '');
    this.filterSVG.setAttribute("height", maxY - minY + 10 + '');
    this.path.setAttribute("d", str);

  }
}
export default Section;