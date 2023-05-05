/**
 * @author mizy
 * @see https://github.com/mizy/OREditor
 */
import Page, { IParagraphData } from './View/Page';
import Keyboard from './Controller/Keyboard'
import Event from './Event'
import './index.less'
import Schema from './Data/Schema';

export interface IOREditorOption {
  container: HTMLDivElement;
  height?: number;
  width?: number;
  data?: any;
  padding?: {
    x: number;
    y: number;
  };
}
class OREditor extends Event {
  container: HTMLDivElement;
  option: IOREditorOption
  page: Page;
  keyboard: Keyboard;
  dom: HTMLDivElement;
  rect: DOMRect;
  timestemp: number;
  startEvent: MouseEvent;
  schema: Schema;
  constructor(option: IOREditorOption) {
    super();
    this.container = option.container;
    this.option = Object.assign({
      height: 600,
      padding: {
        x: 20, y: 10
      }
    }, option);
    this.init();
    // @ts-ignore
    window.OREditorInstance = this;
  }

  init() {
    this.initDOM();
    this.page = new Page(this);
    this.keyboard = new Keyboard(this);
    this.schema = new Schema(this);
    if (!this.option.data) {
      this.schema.setData([{
        type: 'p',
        children: [{
          text: '',
          type: 'span'
        }]
      }]);
    }
    requestAnimationFrame(() => {
      this.resize();
    })
    this.addEvent();
  }

  initDOM() {
    this.dom = document.createElement("div");
    this.dom.classList.add("oreditor");
    this.container.appendChild(this.dom);
    const width = this.container.offsetWidth;
    const height = this.container.offsetHeight;
    if (!this.option.width) {
      this.option.width = width
    }
    if (!this.option.height) {
      this.option.height = height
    }
  }

  resize() {
    this.rect = this.dom.getBoundingClientRect();
    this.page.resize()
  }

  addEvent() {
    this.dom.addEventListener('mousedown', (event) => {
      this.timestemp = event.timeStamp;
      this.startEvent = event;
      this.dom.addEventListener("mousemove", onMouseMove);
    })
    this.dom.addEventListener('mouseup', (event) => {
      const nowTime = event.timeStamp;
      if (nowTime - this.timestemp < 200) {
        this.page.cursor.show();
        this.page.cursor.locate(event);
        this.page.section.hide();
      } else {
        this.page.section.endDrag(event);
        // 选择范围也是一种鼠标选中
        this.page.cursor.focus();
      }
      this.startEvent = undefined;
      this.dom.removeEventListener("mousemove", onMouseMove);
    })
    document.addEventListener('mouseleave', (event) => {
      this.dom.removeEventListener("mousemove", onMouseMove)
    })
    const onMouseMove = (event) => {
      const nowTime = event.timeStamp;
      if (nowTime - this.timestemp > 200) {
        if (this.startEvent) {
          this.page.section.startDrag(this.startEvent)
          this.startEvent = undefined;
        }
        this.page.section.drag(event)
      }
    }
  }
}
export default OREditor;
export {
  Page,
  Keyboard,
  Event
}