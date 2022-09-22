# flex布局

## flex是怎么分配子元素大小的

首先要了解两个`width`属性的值`min-content`和`max-content`前者表示尽可能压缩宽度，一句会尽可能的分行，后者表示在紧包内容的情况下宽度会尽可能的大。

**free space**代表flex容器在计算了子元素所占的空间和之后还剩下的空间，当低于容器宽度时是 **positive free space**当超过容器宽度时是 **negative free space**。

计算子元素空间通过`flex-basis`属性的值，`flex-basis`的值默认为`auto`,这时会先看子元素的`width`属性，如果有值那就等于`width`的值，不然就等于计算子元素`width`的`max-content`情况下值大小。

`flex-grow`属性用于计算子元素的空间增长，值为数字类型，默认值为0，子元素的`flex-grow`属性大于0时，如果此时**free space**为正，那么**positive free space**将按子元素`flex-grow`值大小按比例分配给各个子元素。

`flex-shrink`属性指定了flex 缩小值，默认值为1，原理基本与`flex-grow`一样,不同的是`flex-shrink`计算的是**negative free space**大小并使子元素缩小。但有一点不同的是不会缩小到小于`min-content`宽度

`flex`是`flex-grow`、`flex-shrink`和`flex-basis`的缩写

应用

当需要子元素宽度相同时，使用`flex:1 1 0`而不是`flex:1 1 auto`

参考[mdn](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout/Controlling_Ratios_of_Flex_Items_Along_the_Main_Ax)
