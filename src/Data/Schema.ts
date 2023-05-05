import OREditor from '..';
import { IParagraphData } from '../View/Page';

class Schema {
  history: string[] = []
  editor: OREditor;
  data: IParagraphData[]
  historyIndex: number = 0;
  constructor(editor) {
    this.editor = editor;
    if (this.editor.option.data) {
      this.setData(this.editor.option.data);
    }
  }
  pushHistory() {
    const json = JSON.stringify(this.editor.page.renderer.toJSON())
    const lastJson = this.history[this.historyIndex];
    if (json === lastJson) {
      return;
    }
    this.history.splice(this.historyIndex, this.history.length, json);
  }
  undo() {
    if (this.historyIndex === 0) {
      return;
    }
    this.historyIndex--;
    this.setData(JSON.parse(this.history[this.historyIndex]));
  }
  redo() {
    if (this.historyIndex === this.history.length - 1) {
      return;
    }
    this.historyIndex++;
    this.setData(JSON.parse(this.history[this.historyIndex]));
  }

  setData(data: IParagraphData[]) {
    this.data = data;
    this.editor.page.render();
    this.editor.page.resize();
  }
}
export default Schema;
