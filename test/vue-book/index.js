import createRenderer from "./renderer.js"
import { Fragment } from "./utils.js"
import defineAsyncComponent from "./defineAsyncComponent.js"
function showSetAsProps(el, key, value) {
  //特殊处理
  if (key === "form" && el.tagName === "INPUT") return false
  return key in el
}
const renderer = createRenderer({
  createElement(tag) {
    return document.createElement(tag)
  },
  setElementText(el, text) {
    el.textContent = text
  },
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor)
  },
  patchProps(el, key, prevValue, nextValue) {
    if (/^on/.test(key)) {
      //如果以on开头说明是事件
      const name = key.slice(2).toLowerCase()
      let invokers = el._vei || (el._vei = {})
      let invoker = invokers[key]
      if (nextValue) {
        if (!invoker) {
          invoker = (e) => {
            if (e.timeStamp < invoker.attached) return
            if (Array.isArray(nextValue)) {
              invoker.value.forEach((fn) => {
                fn()
              })
            } else {
              invoker.value(e)
            }
          }
          invoker.value = nextValue
          el.addEventListener(name, invoker)
          invoker.attached = performance.now()
        } else {
          invoker.value = nextValue
        }
        invokers[key] = invoker
      } else if (invoker) {
        el.removeEventListener(name, invoker)
      }
    } else if (showSetAsProps(el, key, nextValue)) {
      //html 中类似disabled属性不写值默认为true
      const type = typeof el[key]
      if (type === "boolean" && nextValue === "") {
        el[key] = true
      } else {
        el[key] = nextValue
      }
    } else {
      el.setAttribute(key, nextValue)
    }
  },
})
const { effect, ref } = Vue
// {const vnode = ref({
//   type: "div",
//   children: [
//     { type: "p", children: "1", key: "1" },
//     { type: "p", children: "2", key: "2" },
//     { type: "p", children: "3", key: "3" },
//     { type: "p", children: "5", key: "5" },
//     { type: "p", children: "6", key: "6" },
//   ],
// })
// setTimeout(() => {
//   vnode.value = {
//     type: "div",
//     children: [
//       { type: "p", children: "1", key: "1" },
//       { type: "p", children: "2", key: "2" },
//       { type: "p", children: "9", key: "9" },
//       { type: "p", children: "5", key: "5" },
//       { type: "p", children: "3", key: "3" },
//       { type: "p", children: "4", key: "4" },
//       { type: "p", children: "6", key: "6" },
//     ],
//   }
// }, 1000)\
// const MyComponent = {
//   render() {
//     return {
//       type: Fragment,
//       children: [
//         { type: "header", children: [this.$slots.header()] },
//         { type: "div", children: [this.$slots.body()] },
//         { type: "footer", children: [this.$slots.footer()] },
//       ],
//     }
//   },
// }
// const componentNode = {
//   type: MyComponent,
//   children: {
//     header() {
//       return { type: "h1", children: "我是标题" }
//     },
//     body() {
//       return { type: "section", children: "我是主题" }
//     },
//     footer() {
//       return { type: "p", children: "我是注脚" }
//     },
//   },
// }}

const AComp = defineAsyncComponent({
  loader: () => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          render() {
            return {
              type: "div",
              children: "testComp",
            }
          },
        })
      }, 5000)
    })
    // return import("./testComp.js")
  },
  delay: 200,
  loadingComp: {
    setup() {
      return () => ({
        type: "div",
        children: "loading...",
      })
    },
  },
  timeout: 10000,
  errorComp: {
    props: { error: "Error" },
    render() {
      return {
        type: "div",
        children: `${this.error}`,
      }
    },
  },
})

const compNode = {
  type: AComp,
}
effect(() => {
  renderer.render(compNode, document.querySelector("#app"))
})
