import { Page } from '../..';
import Renderer from '../../Components/Renderer';
import Span from '../../Components/Span';

export default function Delete(page: Page, renderer: Renderer): boolean {
  let component = renderer.activeComponent;
  let { section, cursor } = page;
  // 有选中一大片时
  if (section.paths.length) {
    const { selections, startPos, endPos } = section.getSelections();
    let startComponent = selections[0] as Span;
    const endComponent = selections[selections.length - 1] as Span;
    const startParent = startComponent.parent;
    const endParent = endComponent.parent;
    if (startComponent === endComponent) {
      startComponent.spliceChar(startPos.index, endPos.index - startPos.index);
      startComponent.update
    } else {
      startComponent.spliceChar(startPos.index, startComponent.data.text.length - startPos.index);
      endComponent.spliceChar(0, endPos.index);
      for (let i = 1; i < selections.length - 1; i++) {
        selections[i].destroy(false);
      };
      if (startParent !== endParent) {//父元素不同时，需要把end的元素也添加到start的父容器里
        const endJSON = endParent.toJSON();
        endParent.destroy();
        startParent.addChildrenData(endJSON.children);
      } else {
        startParent.update(true);
      }
    }
    //首元素被删除
    if (startComponent.cleared) {
      renderer.activeComponent = startParent.children[0];
      renderer.activeComponent.index = 0;
      renderer.activeComponent.focusLine = 0;
    } else {
      startComponent.index = startPos.index;
      renderer.activeComponent = startComponent;
    }
    //检查是否合并
    renderer.checkComposite(renderer.activeComponent);
    section.hide();
    cursor.show();
    cursor.relocate();
    return true;
  }
  const { parent } = component;
  // 当是组件头时
  if (component.index === 0) {
    const prev = component.getPrev();
    // 且是父元素头时
    if (!prev) {
      // 当有缩进时，删除缩进
      if (parent.data.listStyle) {
        delete parent.data.listStyle;
        parent.update();
        cursor.relocate();
        return true;
      }
      //头组件，无前无后就不能删了
      if (!parent.prev) {
        return false;
      };
      const prevParent = parent.prev;
      const json = parent.toJSON();
      const prevJSON = prevParent.toJSON();
      parent.destroy();
      prevParent.addChildrenData(json.children);
      if (json.children.length) {
        renderer.activeComponent = prevParent.children[prevJSON.children.length];
        renderer.activeComponent.index = 0;
      } else {// 为空时，直接跳到上一个组件的末尾
        renderer.activeComponent = prevParent.children[prevParent.children.length - 1];
        renderer.activeComponent.index = renderer.activeComponent.data.text.length;
      }
      renderer.activeComponent.focusLine = renderer.activeComponent.startLineNum;
      renderer.checkComposite(renderer.activeComponent);
      cursor.relocate();
      return true;
    };
    // 删除到前一个组件
    renderer.activeComponent = prev;
    prev.index = prev.data.text.length;
    component = prev;
  }
  component.spliceChar(component.index - 1, 1);
  renderer.checkComposite(renderer.activeComponent);
  cursor.relocate();
  return true;
}