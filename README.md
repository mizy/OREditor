# OREditor
a svg based rich text editor for high performance render
一个基于SVG渲染的原生富文本编辑器，可高性能渲染大量文字

# demo
<img width="1396" alt="截屏2024-06-28 11 17 07" src="https://github.com/mizy/OREditor/assets/7129229/742438af-29a3-4a3c-8760-bcf8a3f0ad9a">
![https://mizy.github.io/oreditor/dist](https://mizy.github.io/oreditor/dist)

# test
```
npm run start
```

# 进度
+ 渲染 100%
+ 焦点获取 100%
+ 输入 100%
+ 删除 100%
+ 样式 100%
+ 区域选中 100%
+ 列表组件 100%
+ 回退操作 100%
+ 居中 100%
+ 三方组件（表格，图片）支持 50%
+ 导出&导入

'''
据说研发一个L3的富文本需要几百万行代码，en,确实很难，之前用ts写了个基于DOM 和selectionAPI的半成品，但感觉这玩意写出来就落伍，于是想试试金山的方案，用svg去实现，可以避免去解决纯用canvas而导致的字体解析以及非矢量导致的图片模糊问题，还能利用浏览器原生的SVG局部渲染裁剪能力。
'''
