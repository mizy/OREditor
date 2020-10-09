import Editor from '../index'
import {SchemaData,SchemaDataItem } from '../Interface/schema'

/**
 * @class
 */
class Schema{
    public editor:Editor;
    constructor(editor:Editor){
        this.editor = editor;
    }

    getData(){
        let data = <SchemaData>{
            content:[{
                type:"p"
            },{
                type:"p"
            },{
                type:"p"
            }]
        };
        return data
    }
}
export default Schema