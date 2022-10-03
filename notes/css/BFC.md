# BFC

## 什么是BFC

**块级格式化上下文（Block Formatting Context）** 是Web页面的可视CSS渲染的一部分，它决定了元素如何对其内容进行定位以及与其他元素的关系和相互作用，当涉及到可视化布局的时候，Block Formatting Context提供了一个环境，HTML元素在这个环境中按照一定规则进行布局。一个环境中的元素不会影响到其它环境中的布局。比如浮动元素会形成BFC，浮动元素内部子元素的主要受该浮动元素影响，两个浮动元素之间是互不影响的。这里有点类似一个BFC就是一个独立的行政单位的意思。可以说BFC就是一个作用范围，把它理解成是一个独立的容器，并且这个容器里box的布局与这个容器外的box毫不相干。

## 怎么创建BFC

- `<html>`
- `float`不是 `none`
- `position` `absolute` 或 `fixed`）
- `display` `inline-block`）
- `display` `table-cell`，
- `display` `table-caption`
- 匿名表格单元格元素（元素的 [`display`](https://developer.mozilla.org/zh-CN/docs/Web/CSS/display) 为 `table、``table-row`、 `table-row-group、``table-header-group、``table-footer-group`（分别是HTML table、row、tbody、thead、tfoot 的默认属性）或 `inline-table`）
- `overflow`不为 `visible` 的块元素
- `display` `flow-root` 的元素
- `contain`值为 `layout`、`content` 或 `strict` 的元素
- flex items
- grid items
- multicol containers
- 元素属性 column-span 设置为 all

## BFC有什么用

- 包含内部浮动（把内部浮动元素包含在内部，可用于清除浮动）
- 排除外部浮动（使元素不会与浮动元素重叠）
- 解决margin合并问题
- 推荐使用`display:flow-root`,不会带来副作用
