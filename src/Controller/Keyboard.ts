import OREditor from '..';
import getAllCommands, { ICommand } from "./commands";
class Keyboard {
  editor: OREditor;
  commands: ICommand[];
  commandsMap: Record<string, ICommand>;
  constructor(editor: OREditor) {
    this.editor = editor;
    this.commands = getAllCommands(editor);
    this.commandsMap = {};
    this.commands.forEach(item => {
      this.commandsMap[item.name] = item;
    })
    this.addEvents();
  }

  execute(command, ...data) {
    this.commandsMap[command].execute(...data)
  }

  addEvents() {
    this.editor.page.cursor.dom.addEventListener("keydown", (e) => {
      const command = this.commands.find(each => {
        if (this.compareEvent(e, each)) {
          return each
        }
      })
      if (command) {
        if(command.name==='Redo'||command.name==='Undo'){
          e.preventDefault();
        }
        command.execute();
      }
    })
  }

  compareEvent(event, each) {
    for (let i = 0; i < each.keys.length; i++) {
      const keys = each.keys[i];
      let flag = true;
      for (let key in keys) {
        if (event[key] !== keys[key]) {
          flag = false;
          break;
        }
      }
      if (flag) {
        return true;
      }
    }
    return false;
  }
}
export default Keyboard;