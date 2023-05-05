import { Page } from '../..';
import Renderer from '../../Components/Renderer';

function SetIndent(type: string, page: Page, renderer: Renderer) {
  const { activeComponent } = renderer;
  const nowP = activeComponent.parent;
  if (nowP.data.listStyle) {
    nowP.data.listStyle.type = type;
  } else {
    nowP.data.listStyle = { type, indent: 0 };
  }
  nowP.update();
}

function ChangeIndent(step: number, page: Page, renderer: Renderer) {
  const { activeComponent } = renderer;
  const nowP = activeComponent.parent;
  if (!nowP.data.listStyle) return;
  nowP.data.listStyle.indent += step;
  nowP.update();
}

export {
  SetIndent,
  ChangeIndent
}