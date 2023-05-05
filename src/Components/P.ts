import { Page } from '..';
import { IParagraphData } from '../View/Page';
import Base from './Base';
import Renderer from './Renderer';
import Span, { ISpanData } from './Span';
import * as components from './index'
/**
 * @class
 */
class P extends Base {
  name = "P";
  tabWidth = 30;//tab 宽度
  // 至少有一个
  children: Span[] = [];
  lineHeight: {// 在Span组件内维护行高
    component: Span;// 行高的组件
    topY: number;// 行高的顶部相对坐标
    bottomY: number;// 行高的底部相对坐标
  }[] = [];//这里定义个每行高的组件
  headChild: Span;
  page: Page;
  oldListType: any;
  listStyleDOM: any;
  data: IParagraphData;
  prev: P;
  next: P;
  globalPos: {
    x: number;
    y: number;
  }
  rightGap: number;// 右侧边界，目前统一为renderer宽度
  constructor(data: IParagraphData, renderer: Renderer) {
    super();
    this.renderer = renderer;
    this.page = renderer.page;
    this.style = data.style || {};
    this.data = data;
    this.data.style = this.style;
    this.globalPos = { x: 0, y: 0 };
    this.init();
  }

  init() {
    this.dom = this.renderer.createElementNS('g');
    this.renderer.g.appendChild(this.dom);
    this.dom.classList.add('ore-p');
    this.initChildren();
  }

  prevTemp: Span;
  getNext = (i: number, children: ISpanData[]) => {
    const child = children[i];
    if (!child) {
      this.prevTemp = undefined;
      return undefined;
    }
    const instance = new Span({
      data: child,
      parent: this,
      prev: this.prevTemp,
    });
    this.prevTemp = instance;
    //上面的优先
    this.children.push(instance);
    const next = this.getNext(++i, children);
    if (next) {
      instance.next = next;
    }
    return instance;
  }

  addChildrenData(children: ISpanData[]) {
    children.forEach(child => {
      this.data.children.push(child)
    })
    const lastChild = this.children[this.children.length - 1];
    this.prevTemp = lastChild;
    lastChild.next = this.getNext(0, children);
    this.update(true);
  }


  setChildrenData(children: ISpanData[]) {
    this.data.children = children;
    this.clearChildren();
    this.initChildren();
    this.update(true);
  }

  // 初始化子节点
  initChildren() {
    const { children } = this.data;
    if (children.length === 0) {
      children.push({
        type: "span",
        text: ''
      })
    }
    //链表头渲染,这里至少会有一个，不能是空容器
    this.headChild = this.getNext(0, children);
  }

  insertSpan(index, data) {
    const prev = this.children[index - 1];
    const next = this.children[index];
    const instance = new Span({
      data,
      parent: this,
      prev,
    });
    this.children.splice(index, 0, instance);
    if (next) {
      next.prev = instance;
    }
    if (prev) {
      prev.next = instance;
    }
    instance.next = next;
    this.headChild = this.children[0];
    return instance
  }

  toJSON = () => {
    const data = {
      ...this.data,
      children: []
    }
    this.children.forEach(item => {
      const json = item.toJSON();
      if (json.text === '') {
        return;
      }
      data.children.push(json)
    })
    return data;
  }

  removeChild(child) {
    // 链表重连
    if (child.prev) {
      child.prev.next = child.next;
    }
    if (child.next) {
      child.next.prev = child.prev;
    }
    // 是否合并
    if (child.prev && child.next) {

    }
    const index = this.children.indexOf(child);
    this.children.splice(index, 1);

    if (this.children.length < 1) {
      this.addEmptySpan();
    }
    // 头元素重置
    this.headChild = this.children[0];
    //cursor重指向
    if (this.renderer.activeComponent === child) {
      if (child.prev) {
        this.renderer.activeComponent = child.prev;
        child.prev.index = child.prev.data.length;
      } else if (child.next) {
        this.renderer.activeComponent = child.next;
        child.next.index = 0;
      } else {
        this.renderer.activeComponent = this.headChild;
        this.headChild.index = 0;
      }
    }
  }

  clearChildren() {
    this.children.forEach(item => {
      item.clear();
    });
    this.children = [];
    this.lineHeight = [];
    this.headChild = undefined;
  }

  checkChildrenComposite() {
    let component = this.headChild;
    let prev = component.prev;
    while (component) {
      this.renderer.checkComposite(component)
      component = component.next;
    }
  }

  addEmptySpan() {
    const instance = new components.span({
      data: {
        text: "",
        type: "span",
        style: {
          fontSize: 14
        }
      },
      parent: this
    });
    this.children.push(instance);
    this.headChild = instance;
  }

  locateByGlobalPos(x: number, y: number): { x: number, y: number, height: number } {
    // 用相对坐标计算位置
    x -= this.globalPos.x;
    y -= this.globalPos.y;
    const child = this.findClosetChild(x, y);
    this.renderer.activeComponent = child;
    // 所有的子元素中都没有找到最近的，就默认变成段落的第一个
    const res = child.locateByPos(x, y);
    res.x += this.globalPos.x;
    res.y += this.globalPos.y;
    return res;
  }

  isInside(child, x, y) {
    const { rect, lineHeight, bbox } = child;
    const topY = bbox.y;
    const bottomY = bbox.y + bbox.height;
    const top2Y = topY + lineHeight;
    const bottom2Y = bottomY - lineHeight;
    const right = bbox.x + bbox.width;
    if (x > right || x < bbox.x || y > bottomY || y < topY) {
      return false;
    }
    if (y < top2Y && x < rect.x) {
      return false
    }
    if (y > bottom2Y && x > rect.endX) {
      return false
    }
    return true;
  }

  getDis(child, x, y) {
    let { rect, textHeights, bbox, lineHeight, fontSizeHeight } = child;
    if (this.isInside(child, x, y)) {
      return -1;
    }
    const rects = [];
    const startLine = this.lineHeight[child.startLineNum];
    const endLine = this.lineHeight[child.endLineNum];
    if (textHeights.length > 1) {
      rects.push({
        left: rect.x,
        right: bbox.x + bbox.width,
        top: startLine.topY,
        bottom: startLine.bottomY
      }, {
        left: bbox.x,
        right: bbox.x + bbox.width,
        top: startLine.bottomY,
        bottom: endLine.topY
      }, {
        left: bbox.x,
        right: rect.endX,
        top: endLine.topY,
        bottom: endLine.bottomY
      })
    } else {
      rects.push({
        left: bbox.x,
        right: rect.endX,
        top: startLine.topY,
        bottom: startLine.bottomY
      })
    }
    let minDis = Infinity;
    rects.forEach(item => {
      let dis;
      if (y <= item.top) {
        if (x < item.left) {
          dis = Math.sqrt(Math.pow(x - item.left, 2) + Math.pow(y - item.top, 2));
        } else if (x > item.right) {
          dis = Math.sqrt(Math.pow(x - item.right, 2) + Math.pow(y - item.top, 2));
        } else {
          dis = item.top - y
        }
      } else if (y >= item.bottom) {
        if (x < item.left) {
          dis = Math.sqrt(Math.pow(x - item.left, 2) + Math.pow(y - item.bottom, 2));
        } else if (x > item.right) {
          dis = Math.sqrt(Math.pow(x - item.right, 2) + Math.pow(y - item.bottom, 2));
        } else {
          dis = y - item.bottom
        }
      } else if (x <= item.left) {
        dis = item.left - x;
      } else {
        dis = x - item.right;
      }
      minDis = Math.min(minDis, dis);
    })
    return minDis;
  }

  findClosetChild(x: number, y: number): Span {
    const { children } = this;
    let min = Infinity;
    let minChild: Span;
    // 先检索出在范围内的所有子元素
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const minDis = this.getDis(child, x, y);
      if (minDis === -1) {//内部直接返回
        return child;
      }
      if (minDis < min) {
        min = minDis;
        minChild = child;
      }
    }
    return minChild;
  }

  getIndentDis() {
    const { listStyle } = this.data;
    if (!listStyle) return 0;
    const { indent = 0 } = listStyle;
    return indent === 0 ? this.tabWidth : indent * this.tabWidth;
  }

  // 根据上面的位置更新下面的
  update(forceRender = false) {
    const { prev } = this;
    if (prev && !forceRender) {
      const globalPos = {
        x: this.getIndentDis(),
        y: prev.rect.endY
      }
      //相同情况下直接取消渲染，节省性能
      if (this.globalPos.x === globalPos.x && this.globalPos.y === globalPos.y) {
        return
      }
      this.globalPos = globalPos;
    }
    this.dom.setAttribute('transform', `translate(${this.globalPos.x},${this.globalPos.y})`);
    this.rightGap = this.renderer.width - this.globalPos.x;
    this.lineHeight = [];
    //右侧边界,
    this.headChild.update();
    this.updateListStyle();
  }
  updateTransform() {
    const { globalPos } = this;
    const { x, y } = globalPos;
    this.dom.setAttribute('transform', `translate(${x},${y})`);
  }

  /**
   * 构造列表样式
   */
  updateListStyle() {
    const { renderer } = this;
    const { listStyle } = this.data;
    // 没有时直接删除
    if (!listStyle) {
      this.listStyleDOM && this.listStyleDOM.remove();
      this.listStyleDOM = null;
      return;
    }
    const { type } = listStyle;
    if (type !== this.oldListType && !this.listStyleDOM) {//已经存在
      this.listStyleDOM && this.listStyleDOM.remove();
      let dom;
      if (type === 'ol') {
        dom = this.renderer.createElementNS('text');
        renderer.innerText(dom, 1)
      } else if (type === "ul") {
        dom = this.renderer.createElementNS('circle');
        dom.setAttribute("r", 3);
        dom.classList.add("ul-circle")
      }
      this.dom.appendChild(dom);
      this.listStyleDOM = dom;
    }
    if (!this.listStyleDOM) return;
    const lineHeight = this.lineHeight[0] ? this.lineHeight[0].component.lineHeight / 2 : 10;
    this.listStyleDOM.setAttribute("transform", `translate(${- 10},${lineHeight})`);
    this.oldListType = type;
  }

  afterUpdate() {
    this.updateBBox();
    if (this.next) {
      this.next.update();
    } else {
      this.page.resize();
    }
  }

  updateBBox() {
    this.bbox = {
      x: 0,
      y: this.globalPos.y,
      width: this.renderer.width,
      height: this.lineHeight.length ? (this.lineHeight[this.lineHeight.length - 1].bottomY - this.lineHeight[0].topY) : 0
    };
    this.rect = {
      ...this.globalPos,
      endX: this.bbox.width,// p的宽度目前为renderer的宽度
      endY: this.globalPos.y + (this.lineHeight.length ? this.lineHeight[this.lineHeight.length - 1].bottomY : 0)
    };
  }

  destroy() {
    this.dom.remove();
    this.children = [];
    this.prev && (this.prev.next = this.next);
    this.next && (this.next.prev = this.prev);
    this.renderer.removeChild(this);
    for (let key in this) {
      this[key] = undefined
    }
  }
}
export default P;