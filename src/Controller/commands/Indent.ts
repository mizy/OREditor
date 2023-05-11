import { Page } from '../..';
import Renderer from '../../Components/Renderer';

function SetIndent(type: string, page: Page, renderer: Renderer) {
  const { activeComponent } = renderer;
  const { cursor } = page;
  const nowP = activeComponent.parent;
  if (!type) { 
    nowP.data.listStyle = undefined
  } else if(nowP.data.listStyle) {
    nowP.data.listStyle.type = type;
  } else {
    nowP.data.listStyle = { type, indent: 0 };
  }
  nowP.update();
  cursor.relocate();
}

function ChangeIndent(step: number, page: Page, renderer: Renderer) {
  const { activeComponent } = renderer;
  const { cursor } = page;
  const nowP = activeComponent.parent;
  if (!nowP.data.listStyle) return;
  nowP.data.listStyle.indent += step;
  nowP.data.listStyle.indent = Math.max(0, nowP.data.listStyle.indent);
  nowP.update();
  cursor.relocate();
}

export {
  SetIndent,
  ChangeIndent
}