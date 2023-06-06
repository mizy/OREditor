
import { Page } from '..';
import { OREditorData } from '../Data/Schema';
import P from './P';
import Span from './Span';
/**
 * @class
 * 全局坐标以renderer的左上角为原点
 */
class Renderer {
  activeComponent: Span;
  children: P[] = [];
  page: Page;
  width: number;
  x: number;
  y: number;
  headChild: any;
  bbox: { width: number; height: number; };
  g: any;
  defs: SVGElement;
  constructor(page: Page) {
    this.page = page;
    this.initDOM();
  }

  initDOM() {
    const { padding, width } = this.page.option;
    this.x = padding.x;
    this.y = padding.y;
    this.width = width - 2 * this.x;
    this.g = this.createElementNS("g");
    this.g.setAttribute("transform", `translate(${this.x},${this.y})`)
    this.page.svg.appendChild(this.g);
    this.defs = this.createElementNS("defs");
    this.page.svg.appendChild(this.defs);
  }

  initTestDOM() {
    this.g.append(this.$(`<g><path stroke-width="1" stroke="red" d="M0 0 L560 0"></path>
        <path stroke="red" stroke-width="1" d="M0 0 L0 560"></path></g>`))
  }

  /**
   * 初始化数据
   */
  render(data: OREditorData) {
    this.clear();
    const {content} = data;
    content.forEach(eachData => {
      // 只会为P
      const instance = new P(eachData, this);
      this.children.push(instance)
    });
    // 默认到初始化位置
    this.children.forEach((item, index) => {
      const prev = this.children[index - 1];
      const next = this.children[index + 1];
      item.prev = prev;
      item.next = next;
    });
    this.headChild = this.children[0];
    this.headChild.update();
    //init activeComponent
    this.activeComponent = this.headChild.headChild;
    this.activeComponent.index = 0;
    this.activeComponent.focusLine = 0;
  }

  createElementNS(tag): SVGElement {
    return this.page.svgDoc.createElementNS('http://www.w3.org/2000/svg', tag)
  }

  /**
   * svg替换内部文本
   * @param {SVGElement} node 
   * @param {Object} data 
   * @returns 
   */
  innerText(node, data) {
    const tspan = this.createElementNS('tspan');
    tspan.appendChild(this.page.svgDoc.createTextNode(data));
    tspan.normalize && tspan.normalize();

    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
    while (tspan.firstChild) {
      node.appendChild(tspan.firstChild);
    }
    return node;
  }


  $(svgText) {
    const parser = new DOMParser()
      , xmlText = "<svg xmlns=\'http://www.w3.org/2000/svg\'>" +
        svgText + "</svg>"
      , docElem = parser.parseFromString(xmlText, "text/xml").documentElement

    const node = docElem.firstChild;
    this.page.svgDoc.importNode(node, true);
    return node
  }

  // 这里的x,y是相对于renderer的坐标
  locateByGlobalPos(x: number, y: number): { x: number, y: number, height: number } {
    const { children } = this;
    let res;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const { rect, bbox } = child;
      if (!rect) continue;
      if (y < (bbox.y + bbox.height)) {
        res = child.locateByGlobalPos(x, y);
        break;
      }
    }
    if (!res) {
      res = children[children.length - 1].locateByGlobalPos(x, y);
    }
    return res;
  }

  update() {
    let height = 0;
    this.children.forEach(item => {
      height += item.bbox.height;
    });
    this.bbox = {
      width: this.width,
      height: height
    }
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    this.children.splice(index, 1)
  }

  mergeData(prev, next) {

  }

  checkComposite(component: Span) {
    if (!component) return false;
    const { next } = component;
    if (!next) {
      return false;
    }
    if (next.type !== component.type) {
      return false;
    }
    if (Object.keys(component.style).length !== Object.keys(next.style).length) {
      return false;
    }
    for (let key in component.style) {
      const value = component.style[key];
      if (value !== next.style[key]) {
        return false;
      }
    }
    const data = next.toJSON();
    next.destroy(false);
    component.addText(data.text);
    component.parent.update(true);
    return true;
  }

  clear() {
    this.children.forEach(each => {
      each.destroy();
    });
    this.children = [];
  }

  getActiveComponentIndex(): number[]{
    const index = [];
    const { activeComponent } = this;
    index[2] = activeComponent.index;
    index[1] = activeComponent.parent.children.indexOf(activeComponent);
    index[0] = this.children.indexOf(activeComponent.parent);
    return index;
  }

  toJSON(): OREditorData {
    const { children } = this;
    const res = [];
    children.forEach(each => {
      res.push(each.toJSON());
    });

    return {
      content: res,
      cursor: {
        index:this.getActiveComponentIndex()
      } 
    };
  }
}
export default Renderer;