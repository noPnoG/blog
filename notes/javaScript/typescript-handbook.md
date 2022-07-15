# typescript

## tsc

`tsc`命令用于将.ts文件编译成.js文件。
需要先安装全局**typescript**依赖`npm install -g typescript`

一般情况下`tsc`命令即使在报错的情况下也会生成对应的js文件
`--noEmitOnError` 选项可以阻止这样的情况

通常`tsc`编译成的js文件的目标是es3
`--target es2015`选项可以指定生成的目标es版本

## types

1. **原始类型** string,number,boolean
2. **数组类型** `Array<T>`，`number[]`
3. **any**

## 类型声明

- **变量** `let x: number`
- **函数** `function add(x: number, y: number): number`
- **对象类型** `{ x: number, y: number }`
- **可选属性** `{ x?: number, y?: number }`
- **聚合类型** `function add(x: number | string): number`

## Type Aliases and Interface

### Type Aliases

```typescript
type Point = {
  x: number;
  y: number;
};
 
// Exactly the same as the earlier example
function printCoord(pt: Point) {
  console.log("The coordinate's x value is " + pt.x);
  console.log("The coordinate's y value is " + pt.y);
}
```

### Interface

```typescript
interface Point {
  x: number;
  y: number;
}
 
function printCoord(pt: Point) {
  console.log("The coordinate's x value is " + pt.x);
  console.log("The coordinate's y value is " + pt.y);
}
 
printCoord({ x: 100, y: 100 });
```

### 异同

基本上两种方式的功能都是一样的，主要区别在于interface比type更具有扩展性。建议是使用`interface`,如果有实现不了的情况再考虑`type`

## 类型断言

```typescript
//as方式
const myCanvas = document.getElementById("main_canvas") as HTMLCanvasElement;
//尖括号方式
const myCanvas = <HTMLCanvasElement>document.getElementById("main_canvas");
```

## tsconfig.json

- `noImplicitAny` 当设为true时，将在某一变量被隐式的推断为any类型时抛出一个错误
- `strictNullChecks` 更明确的处理null和undefined的类型检查，会提醒你null和undefined的情况
