# css网格布局

## 什么是网格布局

网格布局就是将一个容器用水平线和垂直线分割成一个个的网格，将容器内的内容放置在各容器中的布局方式。

## 创建网格容器

在元素上声明`display:grid`或者`display:inline-grid`将使元素成为一个网格容器。

## 网格轨道

使用`grid-template-rows`和`grid-template-columns`来分别定义行轨道和列轨道

使用示例

轨道可以使用任意长度单位，外加一个独特的单位`fr`，代表一份可用空间。

```css
//代表每个轨道200px
grid-template-columns: 200px 200px 200px;
//平均分给三个轨道
grid-template-columns: 1fr 1fr 1fr;
//第一个轨道500px,第二个占剩下的2/3，第三个占剩下1/3
grid-template-columns: 500px 2fr 1fr;
//重复1fr三次，同1fr 1fr 1fr
grid-template-columns: repeat(3,1fr);
//重复1fr 2fr三次
grid-template-columns: repeat(3,1fr 2fr);
```

以上属性都能混用

当没有明确的使用`grid-template-rows`和`grid-template-columns`来设定轨道时，网格将自动创建隐式网格。 可以使用`grid-auto-rows` 和 `grid-auto-columns` 属性来设定尺寸。当使用这两个属性时。可以使用minmax

```css
/**行高200px */
grid-auto-rows:200px;
/** 最小100px 最大自动*/
grid-auto-rows:minmax(100px, auto);

```

## 网格线

当我们设置网格时我们通过`grid-template-rows`设置轨道来实现，但当将内容放置在网格中的时候是痛过网格线来定位的。通过`grid-column-start`, `grid-column-end`, `grid-row-start` and `grid-row-end`来定位放置位置。

```css
/**不填默认代表内容站一格 
负数代表从右往左数
*/

/**表示从垂直线1开始 ，下同 */
grid-column-start: 1;
grid-column-end: 4;
grid-row-start: 1;
grid-row-end: 3;

/** 省略写法 ,意思与上面相同*/
grid-column:1/4;
grid-rows:1/3;


/**更省略 顺序如下
grid-row-start
grid-column-start
grid-row-end
grid-column-end
*/
grid-area: 1 / 4 / 1 / 3;

```
