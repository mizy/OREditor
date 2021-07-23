
class Schema{
    history =[]
    constructor(editor){
        this.editor = editor;
    }
    pushAction(action){
        this.history.push(action);
    }
}
export default Schema;