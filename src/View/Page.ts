
import Cursor from "./Cursor";
import Measure from '../Utils/Measure';
import Renderer from '../Components/Renderer';
import Schema from "../Data/Schema";
import Section from '../Controller/Section';
import OREditor, { IOREditorOption } from '..';
import { ISpanData } from '../Components/Span';

export enum IComponentType {
  "p" = "p",
  "span" = "span",
}
export interface IParagraphData {
  type: string;
  style?: Record<string, any>;
  data?: string;
  listStyle?: {
    type: string;
    indent: number;
  };
  children?: ISpanData[];
}
class Page {
  editor: OREditor;
  renderer: Renderer;
  section: Section;
  cursor: Cursor;
  measure: Measure;
  container: HTMLDivElement;
  dom: HTMLDivElement;
  svg: SVGSVGElement;
  svgDoc: Document;
  constructor(editor: OREditor) {
    this.editor = editor;
    this.init();
  }
  get option() {
    return this.editor.option;
  }

  init() {
    this.initDOM();
    this.renderer = new Renderer(this);
    this.section = new Section(this);
    this.cursor = new Cursor(this);
    this.measure = new Measure(this);
  }

  initDOM() {
    this.container = document.createElement('div');
    this.container.classList.add("ore-container");
    this.editor.dom.append(this.container)
    this.dom = document.createElement('div');
    this.dom.classList.add("ore-page");
    this.dom.style.width = this.option.width + 'px';
    this.dom.style.height = this.option.height + 'px';
    this.container.appendChild(this.dom);
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.classList.add("ore-canvas");
    this.svg.setAttribute("width", this.option.width + '');
    this.dom.append(this.svg);
    this.svgDoc = this.svg.ownerDocument;
    this.addEvents();
  }

  render() {
    this.renderer.render(this.editor.schema.data);
    this.cursor.relocate();
    this.resize();
  }

  resize() {
    const lastP = this.renderer.children[this.renderer.children.length - 1];
    const { bbox } = lastP;
    let height = bbox.y + bbox.height;
    height += 2 * this.option.padding.y + 20;
    this.dom.style.height = height + 'px';
    this.svg.setAttribute("height", height);
  }

  addEvents() {

  }
}
export default Page;