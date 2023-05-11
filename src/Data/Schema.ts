import OREditor from '..';
import { IParagraphData } from '../View/Page';
export interface OREditorData {
  content: IParagraphData[];
  cursor?: {
    index:number[]// [0,0,0] 表示第一个p的第一个span的index为0,用来还原光标状态
  }
}
class Schema {
  history: string[] = []
  editor: OREditor;
  data: OREditorData;
  historyIndex: number = -1;
  historyTimeout: number = 5000;//10s
  historyTimeoutRef: NodeJS.Timeout;
  constructor(editor) {
    this.editor = editor;
    if (this.editor.option.data) {
      this.setInitData(this.editor.option.data);
    }
    this.addHistoryLoop();
  }

  addHistoryLoop() {
    clearTimeout(this.historyTimeoutRef);
    this.historyTimeoutRef = setTimeout(() => {
      this.pushHistory();
      this.addHistoryLoop();
    },this.historyTimeout)
  }

  pushHistory() {
    const json = JSON.stringify(this.editor.page.renderer.toJSON())
    const lastJson = this.history[this.historyIndex];
    if (this.diffJSON(json, lastJson)) {
      return;
    }
    console.log('pushHistory', json);
    this.historyIndex++;
    this.history.splice(this.historyIndex, this.history.length, json);
  }

  diffJSON(json1: string, json2: string):boolean {
    const data1 = JSON.parse(json1);
    const data2 = JSON.parse(json2);
    // delete data that don't effect user feeling
    delete data1.cursor;
    delete data2.cursor;
    return JSON.stringify(data1) === JSON.stringify(data2);
  }

  undo() {
    this.pushHistory();
    if (this.historyIndex <= 0) {
      return;
    }
    this.historyIndex--;
    const data = JSON.parse(this.history[this.historyIndex])
    this.setData(data);
  }
  redo() {
    if (this.historyIndex >= this.history.length - 1) {
      return;
    }
    this.historyIndex++;
    const data = JSON.parse(this.history[this.historyIndex])
    this.setData(data);
    // update cursor
    const { cursor } = data;
    if (cursor) {
      try{
        const { index } = cursor;
        const { renderer } = this.editor.page;
        const component = renderer.children[index[0]].children[index[1]];
        renderer.activeComponent = component;
        component.index = index[2];
        this.editor.page.cursor.relocate();
      } catch (e) {
        console.error("restore cursor index error,please check the cursor.index value need a num arr like [0,1,1]:",e);
      }
    }
  }

  setData(data: OREditorData) {
    this.data = data;
    this.editor.page.render();
    this.editor.page.resize();
  }

  setInitData(data: OREditorData) {
    this.history = [JSON.stringify(data)]
    this.historyIndex = 0;
    this.setData(data);
  }
}
export default Schema;
