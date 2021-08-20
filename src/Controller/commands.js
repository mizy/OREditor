import P from "../Components/P";
import SetStyle from "./commands/SetStyle";
import Delete from "./commands/Delete";
import { render } from "react-dom";
const getAllCommands = (editor, actions) => {
    const { page } = editor;
    const { renderer, cursor, schema } = page;
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
                let component = renderer.activeComponent;
                let nowIndex = component.index;
                let data = {
                    type: "p",
                    children: [],
                };
                let nowP = component.parent;
                let next = component.next;
                if (nowIndex === 0) {
                    data.children.push(component.toJSON());
                    component.destroy(false);
                } else {
                    const oldStr = component.spliceChar(
                        nowIndex,
                        component.data.length - nowIndex
                    );
                    data.children.push({
                        ...component.toJSON(),
                        data: oldStr,
                    });
                }
                while (next) {
                    data.children.push(next.toJSON());
                    const oldComponent = next;
                    next = oldComponent.next;
                    oldComponent.destroy(false); //不渲染
                }

                const instance = new P(data, renderer);
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
                const { index } = activeComponent;
                if (index > 0) {
                    activeComponent.index--;
                } else if (activeComponent.prev) {
                    renderer.activeComponent = activeComponent.prev;
                    renderer.activeComponent.index =
                        renderer.activeComponent.data.length - 1;
                } else if (activeComponent.parent.prev) {
                    const nowP = activeComponent.parent.prev;
                    const nowComp = nowP.children[nowP.children.length - 1];
                    nowComp.index = nowComp.data.length - 1;
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
                    activeComponent.index++;
                } else if (activeComponent.next) {
                    renderer.activeComponent = activeComponent.next;
                    renderer.activeComponent.index = 0;
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
                const { nowLine, parent } = activeComponent;
                console.log(nowLine);
                const nowY = parent.lineHeight[nowLine].topY - 1;
                const { x, y } = activeComponent.getPositionByIndex();
                renderer.findPosition(x, nowY);
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
                const { nowLine, parent } = activeComponent;
                const nowY = parent.lineHeight[nowLine].bottomY + 1;
                const { x, y } = activeComponent.getPositionByIndex();
                renderer.findPosition(x, nowY);
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
                const startPos = start.getPositionByIndex(0);
                section.startPos = {
                    component: start,
                    index: 0,
                    nowLine: 0,
                    x: startPos.x,
                    y: startPos.y,
                };
                const endPos = end.getPositionByIndex(end.data.length);
                section.dragPos = {
                    component: end,
                    index: end.data.length,
                    nowLine: end.endLineNum,
                    x: endPos.x,
                    y: endPos.y,
                };
                cursor.hide();
                section.updatePaths();
                section.update();
            },
            isValid,
        },
    ];
};
export default getAllCommands;
