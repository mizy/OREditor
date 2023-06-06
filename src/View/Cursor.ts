import { Page } from '..';
import { Span, Widget } from '../Components';
import { ISpanData } from '../Components/Span';

class Cursor {
  isFocus = true;
  height = 20;
  composition = false;
  dom: any;
  page: Page;
  x: number;
  y: number;
  style: any;
  compositeLength: number = 0;
  compositionIndex: number = 0;
  offsetX: number = -0.5;
  offsetY: number = 0;

  constructor(page) {
    this.page = page;
    this.x = this.page.option.padding.x;
    this.y = this.page.option.padding.y;
    this.init();
  }

  init() {
    this.dom = document.createElement('input');
    this.dom.classList.add("ore-cursor");
    this.page.dom.appendChild(this.dom);
    this.dom.focus();
    this.addEvents();
  }

  addEvents() {
    const { renderer, editor } = this.page;
    this.dom.addEventListener("blur", () => {
      this.isFocus = true;
      this.dom.classList.add("blur")
    })
    this.dom.addEventListener("focus", () => {
      this.isFocus = false;
      this.dom.classList.remove("blur")
    });
    //是否处于中文
    this.dom.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        const { activeComponent } = renderer;
        e.preventDefault();
        activeComponent.spliceChar(activeComponent.index, 0, '\t');
        this.relocate();
        this.dom.value = '';
      }
    })
    this.dom.addEventListener("input", this.onInput);
    this.dom.addEventListener('compositionstart', (e) => {
      this.compositionIndex = this.style ? 0 : renderer.activeComponent.index;
      this.composition = true;
    });
    this.dom.addEventListener("compositionend", this.onCompositionEnd);
  }

  onInput = (e) => {
    const { renderer, editor } = this.page;
    e.preventDefault(); 
    if (this.page.section.paths.length) {//有选中时，先删除选中项
      editor.keyboard.execute("Delete");
      this.compositionIndex = renderer.activeComponent.index;
    }
    this.checkNewSpan();
    const text = this.dom.value;
    const { activeComponent } = renderer;

    if (!this.composition && text) {
      activeComponent.spliceChar(activeComponent.index, 0, text);
      this.relocate();
      this.dom.value = '';
      this.page.editor.fire("change")
    } else {
      //替换文字
      activeComponent.spliceChar(this.compositionIndex, this.compositeLength, text);
      activeComponent.index = this.compositionIndex + text.length;
      this.compositeLength = text.length;
      this.relocate();
    }
  }

  onCompositionEnd = () => {
    this.composition = false;
    this.page.renderer.activeComponent.index = this.compositionIndex + this.dom.value.length;
    this.dom.value = '';
    this.compositeLength = 0;
    this.relocate();
    this.page.editor.fire("change","compositionend")
  }

  diffStyle() {
    const { style } = this;
    const { renderer } = this.page;
    const { activeComponent } = renderer;
    const {style: nowStyle } = activeComponent;
    let flag = false;
    for (let key in style) {
      if (style[key] !== nowStyle[key]) {
        flag = true;
      }
    }
    return flag
  }

  checkNewSpan() {
    const { renderer } = this.page;
    if (this.diffStyle()||renderer.activeComponent instanceof Widget) {
      const { activeComponent } = renderer;
      const { index, parent, data, style: nowStyle } = activeComponent;
     
      const length = data.text.length;
      const componentIndex = parent.children.indexOf(activeComponent);
      const spliceData = activeComponent.toJSON();
      const nowData:ISpanData = {
        style: {
          ...spliceData.style,
          ...this.style||{},
        },
        type: "span",
        text: "",
      };
      let now:Span;
      if (index === 0) {
        now = parent.insertSpan(componentIndex, nowData);
      } else if (index === length) {
        now = parent.insertSpan(componentIndex + 1, nowData);
      } else {
        const spliceChar = activeComponent.spliceChar(index, activeComponent.data.text.length - index);
        spliceData.text = spliceChar;
        now = parent.insertSpan(componentIndex + 1, nowData);
        parent.insertSpan(componentIndex + 2, spliceData);
      }
      renderer.activeComponent = now;
      now.index = 0;
      now.update(true);//简单点
      this.style = undefined;
    }
  }

  setStyle(style) {
    this.style = style;
    this.focus(true);
  }

  moveTo({ x, y, textHeight = 0, height }) {
    const { renderer } = this.page;
    this.x = x + renderer.x;
    this.y = y + renderer.y;
    this.update();
    this.focus();
  }

  getGlobalXY(event: MouseEvent) {
    const { renderer, dom } = this.page;
    // 这里更新rect
    const rect = dom.getBoundingClientRect();
    // 可视区域的坐标
    let { clientX, clientY } = event;

    //获取到画布坐标系的坐标
    const x = clientX - rect.x - renderer.x;
    const y = clientY - rect.y - renderer.y;
    return {
      x,
      y
    }
  }

  /**
   * 根据事件坐标 - Page的屏幕坐标 - 偏移获取画布坐标系的坐标
   */
  locate(event: MouseEvent) {
    const { renderer } = this.page;
    const { x, y } = this.getGlobalXY(event);
    const res = renderer.locateByGlobalPos(x, y);
    this.x = res.x + renderer.x;
    this.y = res.y + renderer.y;
    this.height = res.height;
    this.update();
    this.focus();
  }

  relocate() {
    const { renderer } = this.page;
    const { activeComponent } = renderer;
    const res = activeComponent.getCursorPosByIndex(activeComponent.index);
    activeComponent.focusLine = res.focusLine;
    this.x = res.x + renderer.x + this.offsetX;
    this.y = res.y + renderer.y + this.offsetY;
    this.update();
    this.focus();
  }

  focus(silent = false) {
    this.dom.focus();
    if (!silent) this.page.editor.fire("focus")
  }

  hide() {
    this.dom.style.zIndex = '-1';
  }

  show() {
    this.dom.style.zIndex = '1';
  }

  update() {
    const { renderer } = this.page;
    const { activeComponent } = renderer;
    this.style = undefined;
    this.dom.style.height = activeComponent.lineHeight + 'px';
    this.dom.style.fontSize = activeComponent.fontSizeHeight + 'px';
    this.dom.style.transform = `translate(${this.x}px,${this.y}px)`;
  }
}
export default Cursor;