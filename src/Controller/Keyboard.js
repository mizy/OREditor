import getAllCommands from "./commands";
import getAllActions from "./actions";
class Keyboard{
    constructor(editor){
        this.editor = editor;
        this.actions = getAllActions(editor)
        this.commands = getAllCommands(editor,this.actions);
        this.addEvents();
    }

    addEvents(){
        this.editor.dom.addEventListener("keyup",(e)=>{
            const command = this.commands.find(each=>{
                if(this.compareEvent(e,each)){
                    return each
                }
            })
            command&&command.execute();
        })
    }

    compareEvent(event,each){
        for(let i =0;i<each.keys.length;i++){
            const keys = each.keys[i];
            let flag = true;
            for(let key in keys){
                if(event[key]!==keys[key]){
                    flag = false;
                    break;
                }
            }
            if(flag){
                return true;
            }
        }
        return false;
    }
}
export default Keyboard;