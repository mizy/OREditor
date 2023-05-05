import Renderer from './Renderer';

class BaseComponent {
  type: string;
  style: any;
  cacheBBox: any;
  dom: any;
  prev;
  next;
  endLineNum: number;
  startLineNum: number;
  rect: any;
  bbox: { x: number; y: any; width: number; height: number; };
  parent: BaseComponent;
  renderer: Renderer;
  rightGap: any;
  cacheData: any;
  data: any;
  getBBox() {
    if (this.data === this.cacheData) return this.cacheBBox;
    this.cacheData = this.data;
    this.cacheBBox = this.dom.getBBox();
    return this.cacheBBox;
  }

  getPrev() {
    if (this.prev) {
      return this.prev;
    }
    return false
  }

  //渲染当前行的头
  updateHead() {
    this.getStartLineHead().update();
  }

  // 获取当前行的头
  getStartLineHead(): BaseComponent {
    let lineHead: BaseComponent = this;
    while (lineHead.prev && lineHead.prev.endLineNum === this.startLineNum) {
      lineHead = lineHead.prev;
    };
    return lineHead;
  }

  splitChar() { }
  update(isChain?: boolean) { }
  delete() {
    this.destroy();
  }
  toJSON: () => any;
  destroy(isRender?: boolean) { }

}
export default BaseComponent;