
/**
 * 图层基础类
 * @class
 */
class Event {
  _listeners: Record<string, Function[]> = {}

  /**
   * 事件监听,用法同jQuery.on
   */
  on(type: string, listener: Function) {
    var listeners = this._listeners;
    if (listeners[type] === undefined) {
      listeners[type] = [];
    }
    if (listeners[type].indexOf(listener) === -1) {
      listeners[type].push(listener);
    }
  }

  /**
   * 触发事件
   * @example
   * this.fire("change",event)
   */
  fire(type: string, event?: any) {
    var listeners = this._listeners;
    var listenerArray = listeners[type];
    if (listenerArray !== undefined) {
      var array = listenerArray.slice(0);
      for (var i = 0, l = array.length; i < l; i++) {
        array[i].call(this, event);
      }
    }
  }

  /**
   * 关闭事件
   * @example
   * this.off('change',onChange)
   */
  off(type: string, listener: Function) {
    var listeners = this._listeners;
    var listenerArray = listeners[type];
    if (listenerArray !== undefined) {
      if (listener) {
        var index = listenerArray.indexOf(listener);
        if (index !== -1) {
          listenerArray.splice(index, 1);
        }
      } else {
        this._listeners[type] = [];
      }
    }
  }

  clearEvents() {
    this._listeners = {}
  }
}
export default Event;
