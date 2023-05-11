import Page from '../View/Page';
import Base from './Base';
import P from './P';

export interface ISpanOption {
  data: ISpanData,
  parent: P,
  prev?: Span,
  next?: Span
}
export interface ISpanData {
  type: string;
  style?: Record<string, any>;
  text?: string;
}
class Span extends Base {
  name = "Span";
  focusLine: number;//当前span获取焦点的行
  indexMap: Record<number, { x: number, y: number, lineNum: number }> = {}
  page: Page;
  prev: Span;
  next: Span;
  parent: P;
  lineHeight: number;
  fontSizeHeight: number;
  disY: number;
  index: number;
  textHeights: number[];
  paths: number[][];
  renderStr: string;
  cleared: boolean;
  data: ISpanData;
  localPos: { x: number; y: number; };// y 是文字底部基准线
  //tips: 尽量不要再初始化的过程中进行数据相关操作，否则类的操控会太过自动化，难以操控，尽量保持专职专能
  constructor({ data, parent, prev, next }: ISpanOption) {
    super();
    this.parent = parent;
    this.renderer = parent.renderer;
    this.page = this.renderer.page;
    this.prev = prev;//单向链表
    this.next = next;//双向链表
    this.style = Object.assign({
      color: "#000000",
      fontSize: 14,
      lineSpace: 10,
      textSpace: 0,
      fontWeight: 'normal',
      fontStyle: 'unset'
    }, data.style);
    this.data = data;
    this.initDOM();
  }

  initFontHeight() {
    const { fontSize = 14 } = this.style;
    const textMatric = this.page.measure.getSizeHeight(fontSize)
    this.lineHeight = textMatric.fontBoundingBoxAscent + textMatric.fontBoundingBoxDescent + this.style.lineSpace;
    this.fontSizeHeight = textMatric.fontBoundingBoxAscent;
    this.disY = this.style.lineSpace / 2;
  }

  initDOM() {
    this.dom = this.renderer.createElementNS('text');
    this.parent.dom.appendChild(this.dom);
    this.dom.classList.add('ore-span');
    this.updateStyle();
  }

  updateStyle() {
    const { color, fontSize, fontWeight, fontStyle } = this.style;
    this.dom.style.fill = color;
    this.dom.style.fontSize = fontSize;
    this.dom.style.fontWeight = fontWeight;
    this.dom.style.fontStyle = fontStyle;
    this.initFontHeight();
  }

  //获取指定索引字符的起始位置
  getCursorPosByIndex(index: number = this.index || 0): {
    x: number,
    y: number,
    focusLine: number,
  } {
    // 若该组件已经没有任何字符串时，位置取根位置
    let pos = this.indexMap[index] || {
      x: this.localPos.x,
      y: this.localPos.y - this.fontSizeHeight,
      lineNum: this.startLineNum
    };

    // 头字母的位置可能存在末尾，或行首
    if (this.isHeadChar(index) && pos.lineNum !== this.focusLine) {
      const prePos = this.indexMap[index - 1];
      if (prePos) {
        pos = {
          x: prePos.x + this.getFontWidth(this.data.text[index - 1]),
          y: prePos.y,
          lineNum: prePos.lineNum
        }
      }
    }

    return {
      focusLine: pos.lineNum,
      x: this.parent.globalPos.x + pos.x,
      y: this.parent.globalPos.y + pos.y - this.fontSizeHeight - this.disY,
    };
  }

  isHeadChar(index: number): boolean {
    if (index === 0) {
      return true;
    }
    // 当是当前行的第一个字母时，光标可以是上一行末尾，或当前行
    const prePos = this.indexMap[index - 1];
    const pos = this.indexMap[index];
    // 不是同一行的情况下
    if (prePos.lineNum !== pos.lineNum) {
      return true
    }
    return false;
  }

  /**
   * 定位并返回当前指针的相对坐标
   */
  locateByPos(x: number, y: number): {
    x: number,
    y: number,
    height: number,
  } {
    const { paths, textHeights, parent } = this;
    this.index = 0;
    for (let i = 0; i < textHeights.length; i++) {
      const bottomY = parent.lineHeight[this.startLineNum + i].bottom;
      //y在组件上方，或者到最后都没有
      if (y < bottomY || i === textHeights.length - 1) {
        let finalX, beforeX, j = 0;
        // 查找前一个坐标和后一个坐标
        for (j = 0; j < paths[i].length; j++) {
          let coord = paths[i][j]
          if (coord > x) {
            finalX = coord;
            beforeX = paths[i][j - 1];
            break;
          }
        };
        if (finalX === undefined) {//没有末尾坐标,说明是结尾，要构建前一个坐标和当前坐标
          beforeX = paths[i][j - 1];
          finalX = paths[i].slice(-1)[0] + this.getFontWidth(this.data.text[this.index + j - 1])
        }
        // 前一个坐标存在则判断中点来定位指针是否-1
        if (beforeX !== undefined) {
          const middle = (beforeX + finalX) / 2;
          if (x < middle || beforeX === finalX) {
            finalX = beforeX;
            j--;
          }
        }
        this.index += j;
        this.focusLine = this.startLineNum + i;
        const finalY = textHeights[i] - this.fontSizeHeight - this.disY;

        return {
          x: finalX,
          y: finalY,
          height: textHeights[i]
        }
      }
      this.index += paths[i].length;
    }
    this.focusLine = this.endLineNum;
    return {
      x: paths[0][0],
      y: textHeights[0] - this.fontSizeHeight,
      height: textHeights[0]
    }
  }

  get globalPos() {
    return {
      x: this.parent.globalPos.x + this.localPos.x,
      y: this.parent.globalPos.y + this.localPos.y
    }
  }

  /**
   * 重新计算当前组件左上角的绝对坐标，和当前行的坐标如果么有前置组件，则为父组件的坐标+字高
   */
  calcPos() {
    let localPos;
    // 有前置的情况
    if (this.prev) {
      const { fontSize, textSpace } = this.style;
      const { rect } = this.prev;
      let lineNum = this.prev.endLineNum;
      const highComponent = this.parent.lineHeight[lineNum]?.component;
      //这里取前置的当前行最大组件
      const prevSize = highComponent.style.fontSize;
      localPos = { x: rect.endX, y: rect.endY };
      const firstStrWidth = this.getFontWidth(this.data[0]);
      // 要换行的情况
      if (localPos.x + firstStrWidth > this.parent.rightGap) {
        lineNum++;
        localPos = { x: 0, y: rect.endY + this.lineHeight };
        this.parent.lineHeight[lineNum] = {
          component: this,
          top: localPos.y - this.fontSizeHeight - this.disY,
          bottom: localPos.y - this.fontSizeHeight - this.disY + this.lineHeight
        };
      } else if (fontSize > prevSize) {//不换行的情况
        let top = this.parent.lineHeight[lineNum].top;
        let beforeY = localPos.y;
        localPos.y = top + this.disY + this.fontSizeHeight;
        this.prev.onLineFontSizeChange(beforeY, localPos.y);
        // 更改记录当前行的最大高度
        this.parent.lineHeight[lineNum] = {
          component: this,
          top,
          bottom: top + this.lineHeight
        };
      }
      this.startLineNum = lineNum;
      localPos.x += textSpace;
    } else {// 无前置的情况坐标要从parent取
      // 第一行
      this.parent.lineHeight[0] = {
        component: this,
        top: 0,
        bottom: this.lineHeight
      };
      this.startLineNum = 0;
      localPos = { x: 0, y: this.disY + this.fontSizeHeight };
    }
    this.localPos = localPos;
  }

  getFontWidth(str) {
    if (str === undefined) return 0;
    let width = this.style.fontSize;
    if (this.isChinese(str)) {//汉字时，重置字符串状态
    } else if (str === ' ') {//空格也要重新计算英文
      width *= 0.5;
    } else {//字母第一次换行不能截断
      width = this.page.measure.measure(str, this.style.fontSize);
    }
    return width
  }

  addText(data) {
    this.data.text += data;
  }

  isChinese(temp) {
    var re = /[^\u4e00-\u9fa5]/;
    if (re.test(temp)) return false;
    return true;
  }

  /**
   * 更新路径
   * @param {boolean} 是否是链式渲染下来的
   */
  update(flag = true) {
    if (flag)
      this.calcPos();

    // 这里先生成坐标，再对坐标进行变换
    this.makePaths();
    this.updateParentLineHeight();

    // 链式渲染
    if (this.next) {
      this.next.update(true);
    } else {
      this.parent.lineHeight.splice(this.endLineNum + 1, this.parent.lineHeight.length - this.endLineNum - 1)
      this.parent.afterUpdate()
    }
  }

  render() {
    this.updateAlign();
    this.renderPaths();
  }

  updateAlign() {
    const { style={} } = this.parent.data;
    const { textAlign = "left" } = style;
    if (textAlign&&textAlign !== "left") {
      for (let i = 0; i < this.paths.length; i++) {
        const path = this.paths[i];
        const lineNum = i + this.startLineNum;
        const lineHeight = this.parent.lineHeight[lineNum];
        const { width } = lineHeight;
        const offset = (this.parent.rightGap - this.parent.globalPos.x - width) / (textAlign==="center"?2:1);
        for (let j = 0; j < path.length; j++) {
          path[j] += offset;
        }
      }
    }
  }

  // 生成每个字符的坐标，这里实现居中逻辑会更好点，专人专事，减少其他地方调用类内部属性的逻辑
  makePaths() {
    const { measure, option: { padding } } = this.page;
    const { fontSize = 14, textSpace } = this.style;
    const rightGap = this.parent.rightGap;
    //该组件每行高度
    // 字高，用来向上偏移
    let { x, y } = this.localPos;
    // x坐标数组
    let paths = [
      [x]
    ];
    // 每行y坐标数组
    let textHeights = [y];

    let lineNum = 0;

    const strs = this.data.text.split('');
    let chars = [];
    let hasWrapped = false;//标识当前字母串是否已经换过行
    strs.forEach((str, i) => {
      let width = fontSize;
      if (this.isChinese(str)) {//汉字时，重置字符串状态
        chars = [];
        hasWrapped = false;
      } else if (str === '\t') {//tab不放到paths里
        chars = [];
        width *= 2;
        hasWrapped = false;
      } else if (str === ' ') {//空格不放到paths里
        chars = [];
        width *= 0.5;
        hasWrapped = false;
      } else {//字母第一次换行不能截断
        width = measure.measure(str, fontSize);
        chars.push(str);
      }
      x += width + textSpace;
      /**
       *  这里有两种做法，要么换行时，拆分为另一个span，要么用一个span，但是要记录每个字的y左标，要想下前一种是否更简单
       *  如果每个换行都拆span，问题是会导致数据生成巨量的span，而且每个span都要计算位置，这样会导致性能问题，对使用svg做为渲染器的场景，不可接受
       * */
      if (x > rightGap) {
        x = 0;
        // 这里应该是取当前行最大组件的行高
        if (textHeights.length === 1) {
          y = this.parent.lineHeight[this.startLineNum].bottom + this.disY + this.fontSizeHeight;
        } else {
          y += this.lineHeight;
        }
        textHeights.push(y);
        if (chars.length && !hasWrapped && chars.length < paths[lineNum].length) {//英文没换过行则需要出栈队列里的所有字母,这里排除一行全部都是一个单词的情况
          const beforePos = paths[lineNum].splice(paths[lineNum].length - chars.length, chars.length);
          const firstPos = beforePos[0];
          lineNum++;
          paths[lineNum] = [];
          beforePos.forEach(each => {
            paths[lineNum].push(each - firstPos);
          })
          x = paths[lineNum].slice(-1)[0] + width + textSpace;//获取最后一个单词的为值，为下一个做准备
          hasWrapped = true;//标识已经换过行,下次换行时走正常逻辑
        } else {//中文或已经换过行只需要出栈一次
          paths[lineNum].pop();//上一个字符出栈
          lineNum++;
          paths[lineNum] = [];
          paths[lineNum].push(x);
          x = width + textSpace;
        }
      }

      paths[lineNum].push(x);
    });
    this.endLineNum = this.startLineNum + textHeights.length - 1;
    this.paths = paths;
    this.textHeights = textHeights;
  }

  updateParentLineHeight() {
    for (let i = 0; i < this.textHeights.length; i++) {
      // 给新产生的行+1
      if (i >= 1) {
        this.parent.lineHeight[this.startLineNum + i] = {
          component: this,
          top: this.textHeights[i] - this.fontSizeHeight - this.disY,
          bottom: this.textHeights[i] - this.fontSizeHeight - this.disY + this.lineHeight,
        }
      }
      // 这里记录下每行的宽度，以便做居中逻辑时，对生成的坐标后处理
      const line = this.parent.lineHeight[this.startLineNum + i];
      const minLeft = Math.min(line.left || Infinity, this.paths[i][0]);
      const maxRight = Math.max(line.right || -Infinity, this.paths[i].slice(-1)[0]);
      line.left = minLeft;
      line.right = maxRight;
      line.width = maxRight - minLeft;
    }
  }

  renderPaths() {
    this.indexMap = {}
    const { text: data } = this.data;
    let i = 0;
    let xStr = '', yStr = '';
    /**
     * @param {String} 当前渲染的字符串(不包含空格)
     */
    this.renderStr = '';
    // 在这里做居中逻辑
    this.paths.forEach((path, lineNum) => {
      // path.pop();
      path.forEach((x, index) => {
        const y = this.textHeights[lineNum];
        this.indexMap[i] = {
          x,
          y,
          lineNum: this.startLineNum + lineNum,
        };
        // ||index===path.length-1 不用把最后一个坐标去掉吧
        if (data[i] === ' ' || data[i] === '\t') {
          i++;
          return false;//空格跳过
        }
        this.renderStr += data[i] || "";
        i++;
        xStr += `${(x).toFixed(2)} `;
        yStr += `${(y).toFixed(2)} `;
      })
    });
    this.dom.textContent = this.renderStr;
    this.dom.setAttribute('x', xStr);
    this.dom.setAttribute('y', yStr);
    this.getBBox();
  }

  getBBox() {
    const rect: any = {
      ...this.localPos
    };
    this.rect = rect;
    rect.endX = this.paths.slice(-1)[0].slice(-1)[0];
    rect.endY = this.textHeights.slice(-1)[0];
    if (this.textHeights.length === 1) {
      rect.y = rect.endY;
    }
    this.bbox = this.dom.getBBox();
    return rect;
  }

  // 当前行的文字大小改变时，最后一行的Y坐标也要相应改变
  onLineFontSizeChange(beforeY: number, nowY: number) {
    const lastY = this.textHeights[this.textHeights.length - 1]
    if (lastY >= beforeY) {
      this.textHeights[this.textHeights.length - 1] = nowY;
      if (this.textHeights.length === 1) {//只有一行的情况，组件的全局坐标也给他改咯
        this.localPos.y = nowY;
      }
      this.renderPaths();
      if (this.prev) {
        this.prev.onLineFontSizeChange(beforeY, nowY)
      }
    }

  }

  /**
   * 删除指定长度的文字，且返回被删除的文字
   */
  spliceChar(index: number, number: number, str = "") {
    const { text } = this.data;
    if (index === 0 && number >= text.length && !str) {
      const oldStr = text;
      this.destroy();
      return oldStr;
    }
    //新增情况
    if (number === 0) {
      this.data.text = text.substring(0, index) + str + text.substring(index + number);
      this.index = index + str.length;
      this.update(false);
      return str;
    }
    const oldStr = text.substr(index, number);
    this.data.text = text.substring(0, index) + str + text.substring(index + number);
    // 更新当前指针
    this.index = Math.max(index, 0);
    this.update(false);
    return oldStr;
  }

  //清空
  clear() {
    this.dom.remove();
    for (let key in this) {
      this[key] = undefined;
    }
    this.cleared = true
  }

  destroy(isRender = true) {
    // 简单粗暴不进行最优渲染，直接渲染当前段落，后续可以优化为值渲染当前行
    this.parent.removeChild(this);
    this.parent.lineHeight = [];
    if (isRender) {
      this.parent.headChild.update();
    }
    this.clear();
  }

  toJSON = (): ISpanData => {
    return JSON.parse(JSON.stringify(this.data))
  }
}
export default Span;