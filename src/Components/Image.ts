import Widget from './Widget';

class Image extends Widget {
  initDOM() {
    this.dom = this.renderer.createElementNS('image');
    this.parent.dom.appendChild(this.dom);
    this.dom.classList.add('ore-span');
    this.updateStyle();
  }
  
  renderPaths(): void {
    const x = this.paths[0][0];
    const y = this.localPos.y - this.data.height;
    this.dom.setAttribute('x', x + '');
    this.dom.setAttribute('y', y + '');
    this.dom.setAttribute('width', this.data.width||(this.parent.rightGap - this.localPos.x) + '');
    if (this.data.height) {
      this.dom.setAttribute('height', this.data.height + '');
    }
    if (this.data.data.href) {
      this.dom.setAttribute('href', this.data.data.href + '');
    }
    this.indexMap[0] = {
      x,
      y:this.localPos.y,
      lineNum: this.startLineNum,
    };
    this.rendered = true;
    this.getBBox();
  }
}
export default Image