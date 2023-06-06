import Span  from './Span';
// import Table from './Table';

class Widget extends Span {
  initDOM() {
    this.dom = this.renderer.createElementNS('foreignObject');
    this.parent.dom.appendChild(this.dom);
    this.data.text = ' ';
    this.dom.classList.add('ore-span');
    this.updateStyle();
  }

  getFontWidth(str: any) {
    return this.data.width;
  }

  initFontHeight() {
    this.lineHeight = this.data.height + this.style.lineSpace;
    this.fontSizeHeight = this.data.height || 150;
    this.disY = this.style.lineSpace / 2;
    this.style.fontSize = this.data.height;
  }

  makePaths(): void {
    this.endLineNum = this.startLineNum;
    this.paths = [[this.localPos.x, this.localPos.x + this.data.width]];
    if (this.paths[0][1] > this.parent.rightGap) {
      this.paths = [[0,]]
    }
    this.textHeights = [this.localPos.y];
    this.rendered = false;
    this.getBBox();
  }

  renderPaths(): void {
    this.dom.setAttribute('x', this.paths[0][0] + '');
    this.dom.setAttribute('y', this.textHeights[0] - this.data.height);
    this.rendered = true;
    this.getBBox();
  }
  
}

export default Widget;