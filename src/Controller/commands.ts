import P from "../Components/P";
import SetStyle from "./commands/SetStyle";
import Delete from "./commands/Delete";
import OREditor from '..';
import { IParagraphData } from '../View/Page';
import { ChangeIndent, SetIndent } from './commands/Indent';

export interface ICommand {
  name: string
  keys: {
    key: string,
    altKey?: boolean,
    metaKey?: boolean,
    ctrlKey?: boolean,
    shiftKey?: boolean,
  }[],
  execute: (userData?: any) => void;
  isValid: () => boolean;
}
const getAllCommands = (editor: OREditor): ICommand[] => {
  const { page } = editor;
  const { renderer, cursor } = page;
  const isValid = () => {
    return true;
  };
  return [
    {
      name: "Delete",
      keys: [
        {
          key: "Backspace",
          altKey: false,
          ctrlKey: false,
          shiftKey: false,
        },
      ],
      execute: function () {
        Delete.call(this, page, renderer);
      },
      isValid,
    },
    {
      // 换行，把当前元素后面的全部插入新的p组件，然后重绘
      name: "Wrap",
      keys: [
        {
          key: "Enter",
          altKey: false,
          ctrlKey: false,
          shiftKey: false,
        },
      ],
      execute: function () {
        if (cursor.composition) {
          return;
        }
        let component = renderer.activeComponent;
        let nowIndex = component.index;
        let nowP = component.parent;
        const oldJSON = nowP.toJSON();
        let newPData: IParagraphData = {
          type: "p",
          listStyle: oldJSON.listStyle?{...oldJSON.listStyle}:undefined,
          children: [],
        };
        let next = component.next;
        if (nowIndex === 0) {
          newPData.children.push(component.toJSON());
          component.destroy(false);
        } else {
          const oldStr = component.spliceChar(
            nowIndex,
            component.data.text.length - nowIndex
          );
          newPData.children.push({
            style: component.toJSON().style,
            type: "span",
            text: oldStr,
          });
        }
        while (next) {
          newPData.children.push(next.toJSON());
          const oldComponent = next;
          next = oldComponent.next;
          oldComponent.destroy(false); //不渲染
        }

        const instance = new P(newPData, renderer);
        instance.prev = nowP;
        instance.next = nowP.next;
        if (nowP.next) {
          nowP.next.prev = instance;
        }
        nowP.next = instance;
        const nowPIndex = renderer.children.indexOf(nowP);
        renderer.children.splice(nowPIndex + 1, 0, instance);
        renderer.activeComponent = instance.headChild;
        renderer.activeComponent.index = 0;
        nowP.update(true);
        cursor.relocate();
        editor.fire("change")
      },
      isValid,
    },
    {
      name: "Left",
      keys: [
        {
          key: "ArrowLeft",
          altKey: false,
          ctrlKey: false,
          shiftKey: false,
        },
      ],
      execute: function () {
        const { activeComponent } = renderer;
        const { index, indexMap } = activeComponent;
        if (index > 0) {
          const isHead = activeComponent.isHeadChar(index);
          const pos = indexMap[index];
          if (isHead && pos.lineNum === activeComponent.focusLine) {// 当前行数和下一个字符的行数不一样，说明是要换行去前一个的末尾了
            activeComponent.focusLine = pos.lineNum - 1;
            return cursor.relocate();
          }
          activeComponent.index--;
        } else if (activeComponent.prev) {
          renderer.activeComponent = activeComponent.prev;
          renderer.activeComponent.index = renderer.activeComponent.data.text.length - 1;
        } else if (activeComponent.parent.prev) {
          const nowP = activeComponent.parent.prev;
          const nowComp = nowP.children[nowP.children.length - 1];
          nowComp.index = nowComp.data.text.length;
          renderer.activeComponent = nowComp;
        }
        cursor.relocate();
      },
      isValid,
    },
    {
      name: "Right",
      keys: [
        {
          key: "ArrowRight",
          altKey: false,
          ctrlKey: false,
          shiftKey: false,
        },
      ],
      execute: function () {
        const { activeComponent } = renderer;
        const { index, indexMap } = activeComponent;
        if (indexMap[index + 1]) {
          const isHead = activeComponent.isHeadChar(index);
          const pos = indexMap[index];
          if (isHead && pos.lineNum !== activeComponent.focusLine) {// 当前行数和下一个字符的行数不一样，说明是要换行去前一个的末尾了
            activeComponent.focusLine = pos.lineNum;
            return cursor.relocate();
          }
          activeComponent.index++;
        } else if (activeComponent.next) {
          renderer.activeComponent = activeComponent.next;
          renderer.activeComponent.index = 1;
        } else if (activeComponent.parent.next) {
          const nowP = activeComponent.parent.next;
          const nowComp = nowP.children[0];
          nowComp.index = 0;
          renderer.activeComponent = nowComp;
        }
        cursor.relocate();
      },
      isValid,
    },
    {
      name: "Up",
      keys: [
        {
          key: "ArrowUp",
          altKey: false,
          ctrlKey: false,
          shiftKey: false,
        },
      ],
      execute: function () {
        const { activeComponent } = renderer;
        const { focusLine, parent } = activeComponent;
        const nowY = parent.lineHeight[focusLine].top - 1;
        const { x } = activeComponent.getCursorPosByIndex();
        renderer.locateByGlobalPos(x, nowY + parent.globalPos.y);
        cursor.relocate();
      },
      isValid,
    },
    {
      name: "Down",
      keys: [
        {
          key: "ArrowDown",
          altKey: false,
          ctrlKey: false,
          shiftKey: false,
        },
      ],
      execute: function () {
        const { activeComponent } = renderer;
        const { focusLine, parent } = activeComponent;
        const nowY = parent.lineHeight[focusLine].bottom + 1;
        const { x, y } = activeComponent.getCursorPosByIndex();
        renderer.locateByGlobalPos(x, nowY + parent.globalPos.y);
        cursor.relocate();
      },
      isValid,
    },
    {
      name: "SetStyle",
      keys: [],
      execute: function (style) {
        //删掉对应的片段然后再新增带样式的片段
        SetStyle.call(this, style, page, renderer);
      },
      isValid,
    },
    {
      name: "SelectAll",
      keys: [
        { key: "a", altKey: false, ctrlKey: true, shiftKey: false },
        {
          key: "a",
          altKey: false,
          metaKey: true,
          ctrlKey: false,
          shiftKey: false,
        },
      ],
      execute: function () {
        const { section, cursor } = page;
        const start = renderer.children[0].children[0];
        const end = renderer.children
          .slice(-1)[0]
          .children.slice(-1)[0];
        const startPos = start.getCursorPosByIndex(0);
        section.startPos = {
          component: start,
          index: 0,
          focusLine: 0,
          x: startPos.x,
          y: startPos.y,
        };
        const endPos = end.getCursorPosByIndex(end.data.text.length);
        section.dragPos = {
          component: end,
          index: end.data.text.length,
          focusLine: end.endLineNum,
          x: endPos.x,
          y: endPos.y,
        };
        cursor.hide();
        section.updatePaths();
        section.update();
      },
      isValid,
    },
    {
      name: "SetIndent",
      keys: [],
      execute: function (type: string) {
        SetIndent.call(this, type, page, renderer);
      },
      isValid,
    },
    {
      name: "ChangeIndent",
      keys: [],
      execute: function (step: number) {
        ChangeIndent.call(this, step, page, renderer);
      },
      isValid,
    },
    {
      name: "Redo",
      keys: [{ key: "z", altKey: false, ctrlKey: true, shiftKey: true },
        {
          key: "z",
          altKey: false,
          metaKey: true,
          ctrlKey: false,
          shiftKey: true,
        }],
      execute: function () {
        editor.schema.redo();
      },
      isValid,
    },
    {
      name: "Undo",
      keys: [{ key: "z", altKey: false, ctrlKey: true, shiftKey: false },
        {
          key: "z",
          altKey: false,
          metaKey: true,
          ctrlKey: false,
          shiftKey: false,
        }],
      execute: function () {
        editor.schema.undo();
      },
      isValid,
    },
    {
      name: "SetTextAlign",
      keys: [],
      execute: function (align: string) {
        const { activeComponent } = renderer;
        const { parent } = activeComponent;
        parent.setStyle({
          "textAlign": align,
        });
        parent.update();
        cursor.relocate();
        // 同时更新选中块，有点麻烦，得更改startPos的坐标，然后重新渲染,一般不会有这种需求
        page.section.hide();
      },
      isValid
    }
  ];
};
export default getAllCommands;
