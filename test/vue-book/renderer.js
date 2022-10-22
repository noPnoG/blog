import { setCurrentInstance } from "./lifeCycle.js"
import {
  getSequence,
  resolveProps,
  hasPropsChange,
  Fragment,
  Text,
} from "./utils.js"
export default function createRenderer(options) {
  const { createElement, setElementText, insert, patchProps } = options
  //挂载函数
  function mountElement(vnode, container, anchor) {
    const el = (vnode.el = createElement(vnode.type))
    if (vnode.props) {
      for (let key in vnode.props) {
        patchProps(el, key, null, vnode.props[key])
      }
    }
    if (typeof vnode.children === "string") {
      setElementText(el, vnode.children)
    } else if (Array.isArray(vnode.children)) {
      //如果子节点是数组，则遍历每一个节点并且使用patch挂载它们
      vnode.children.forEach((child) => {
        patch(null, child, el)
      })
    }
    insert(el, container, anchor)
  }
  const { reactive, watchEffect, shallowReactive } = Vue
  //挂载组件节点
  function mountComponent(vnode, container, anchor) {
    //通过vnode获取组件选项 即vnode.type
    const componentOption = vnode.type
    //获取render函数
    let {
      render,
      data,
      props: propsOption,
      setup,
      beforeCreate,
      created,
      beforeMount,
      mounted,
    } = componentOption
    beforeCreate && beforeCreate()
    //响应式数据
    const state = data ? reactive(data()) : null
    const [props, attrs] = resolveProps(propsOption, vnode.props)
    function emit(event, ...payload) {
      const handler = props[`on${event[0].toUpperCase() + event.slice(1)}`]
      if (handler) {
        handler(...payload)
      } else {
        console.error(`事件${event}不存在`)
      }
    }
    const slots = vnode.children || {}
    const setupContext = { attrs, emit, slots }
    //定义组件实例
    const instance = {
      state, //组件状态
      props: shallowReactive(props),
      isMounted: false, //组件是否已经挂载
      subTree: null, //组件的虚拟DOM
      slots, //组件插槽
      unmounted: [],
    }
    vnode.component = instance
    let setupState = null
    setCurrentInstance(instance)
    const setupResult = setup ? setup(props, setupContext) : {}
    setCurrentInstance(null)
    if (typeof setupResult === "function") {
      if (render) console.error("render函数已存在，将覆盖render函数")
      render = setupResult
    } else {
      setupState = setupResult
    }
    //渲染组件的上下文
    const renderContext = new Proxy(instance, {
      get(t, k, r) {
        const { state, props, slots } = t
        if (k === "$slots") return slots
        if (state && k in state) {
          return state[k]
        } else if (props && k in props) {
          return props[k]
        } else if (setupState && k in setupState) {
          return setupState[k]
        } else {
          console.error("不存在")
        }
      },
      set(t, k, v, r) {
        const { state, props } = t
        if (state && k in state) {
          state[k] = v
        } else if (props && k in props) {
          props[k] = v
        } else if (setupState && k in setupState) {
          setupState[k] = v
        } else {
          console.error("不存在")
        }
        return true
      },
    })
    created && created().call(renderContext)
    //响应式组件更新
    watchEffect(() => {
      const instance = vnode.component
      //获取要渲染的节点，即render函数返回值

      const subTree = render.call(renderContext, renderContext)

      //初次挂载
      if (!instance.isMounted) {
        //挂载节点
        beforeMount && beforeMount.call(renderContext)
        patch(null, subTree, container, anchor)
        instance.isMounted = true
        //加载完成 mounted时事件周期
        mounted && mounted.call(renderContext)
      } else {
        //更新节点
        patch(instance.subTree, subTree, container, anchor)
      }
      instance.subTree = subTree
    })
  }
  //更新组件节点
  function patchComponent(n1, n2) {
    const instance = (n2.component = n1.component)
    const { props } = instance
    if (hasPropsChange(n1.props, n2.props)) {
      //更新props
      const [nextProps] = resolveProps(props, n2.props)
      for (let key in nextProps) {
        props[key] = nextProps[key]
      }
      //删除props
      for (let key in props) {
        if (!(key in nextProps)) delete props[key]
      }
    }
  }
  //更新节点
  function patchElement(n1, n2) {
    const el = (n2.el = n1.el)
    const oldProps = n1.props || {}
    const newProps = n2.props || {}

    //更新prop
    for (let key in newProps) {
      if (oldProps[key] !== newProps[key]) {
        patchProps(el, key, oldProps[key], newProps[key])
      }
    }
    for (let key in oldProps) {
      if (!key in newProps) {
        patchProps(el, key, oldProps[key], null)
      }
    }
    //更新children
    patchChildren(n1, n2, el)
  }
  //更新子节点
  function patchChildren(n1, n2, el) {
    //新子节点是文本
    if (typeof n2.children === "string") {
      //新子节点如果是数组则逐个挂载
      if (Array.isArray(n1.children)) {
        n1.children.forEach((child) => {
          unmount(child)
        })
      }
      //设为文本
      setElementText(el, n2.children)
    } else if (Array.isArray(n2.children)) {
      //新节点是数组
      if (Array.isArray(n1.children)) {
        patchKedChildren3(n1, n2, el)
      } else {
        setElementText(el, "")
        n2.children.forEach((child) => {
          patch(null, child, el)
        })
      }
    } else {
      //新节点为空
      if (Array.isArray(n1.children)) {
        n1.children.forEach((child) => {
          unmount(child)
        })
      } else {
        setElementText(el, "")
      }
    }
  }
  //更新带key的子节点 - 简单diff
  function patchKedChildren(n1, n2, el) {
    //如果旧节点点是数组要进行diff
    const oldChildren = n1.children
    const newChildren = n2.children
    //有key的比较
    let lastIndex = 0
    //循环新节点
    for (let i = 0; i < newChildren.length; i++) {
      let newVNode = newChildren[i]
      //判断是否能找到相同key
      let find = false
      //循环旧节点
      for (let j = 0; j < oldChildren.length; j++) {
        let oldVNode = oldChildren[j]
        //如果两节点的key相同
        if (newVNode.key === oldVNode.key) {
          find = true
          patch(oldVNode, newVNode, el)
          //如果j小于lastIndex则需要交换位置
          if (j < lastIndex) {
            //交换位置就是将el放置到新子节点的上一个节点el后面
            const prevVNode = newChildren[i - 1]
            if (prevVNode) {
              const anchor = prevVNode.el.nextSibling
              insert(oldVNode.el, el, anchor)
            }
          } else {
            //否则lastIndex=j
            lastIndex = j
          }
          break
        }
      }
      //如果新字节点不能找到相同的key
      if (find === false) {
        //执行添加操作

        //然后将newVNode的el放置在上一节点的el后
        const prevVNode = newChildren[i - 1]
        let anchor = null
        if (prevVNode) {
          anchor = prevVNode.el.nextSibling
        } else {
          anchor = el.firstChild
        }
        patch(null, newVNode, el, anchor)
      }
    }
    //遍历旧子节点
    for (let i = 0; i < oldChildren.length; i++) {
      const oldVNode = oldChildren[i]
      //如果新节点中没有对应key 则需要删除
      const has = newChildren.some((VNode) => {
        return VNode.key === oldVNode.key
      })
      if (!has) {
        unmount(oldVNode)
      }
    }
  }
  //更新带key的子节点 - 双端diff
  function patchKedChildren2(n1, n2, container) {
    const oldChildren = n1.children
    const newChildren = n2.children
    //四个索引
    let oldStartIndex = 0
    let oldEndIndex = oldChildren.length - 1
    let newStartIndex = 0
    let newEndIndex = newChildren.length - 1
    //四个节点
    let oldStartVNode = oldChildren[oldStartIndex]
    let oldEndVNode = oldChildren[oldEndIndex]
    let newStartVNode = newChildren[newStartIndex]
    let newEndVNode = newChildren[newEndIndex]
    //循环
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      if (!oldStartVNode) {
        oldStartVNode = oldChildren[++oldStartIndex]
      } else if (!oldEndVNode) {
        oldEndVNode = oldChildren[--oldEndIndex]
        //当新旧初始节点一样时
      } else if (oldStartVNode.key === newStartVNode.key) {
        //更新一下节点
        patch(oldStartVNode, newStartVNode, container)
        //指针指向下一个
        oldStartVNode = oldChildren[++oldStartIndex]
        newStartVNode = newChildren[++newStartIndex]
        //新旧子节点的末尾节点key一样
      } else if (oldEndVNode.key === newEndVNode.key) {
        //更新一下节点
        patch(oldEndVNode, newEndVNode, container)
        //指针指向上一个
        oldEndVNode = oldChildren[--oldEndIndex]
        newEndVNode = newChildren[--newEndIndex]
        //旧字节点的开始节点和新子节点的结束节点一样
      } else if (oldStartVNode.key === newEndVNode.key) {
        patch(oldStartVNode, newEndVNode, container)
        //将旧开始节点的el插入到旧结束节点的后面
        insert(oldStartVNode.el, container, oldEndVNode.el.nextSibling)
        //改变指针
        oldStartVNode = oldChildren[++oldStartIndex]
        newEndVNode = newChildren[--newEndIndex]
        //新字节点的开始节点和旧子节点的结束节点一样
      } else if (newStartVNode.key === oldEndVNode.key) {
        patch(oldEndVNode, newStartVNode, container)
        //将旧字节点末尾的el插入到旧子节点开始的el 的前面
        insert(oldEndVNode.el, container, oldStartVNode.el)
        //改变指针
        newStartVNode = newChildren[++newStartIndex]
        oldEndVNode = oldChildren[--oldEndIndex]
      } else {
        //如果都找不到
        //直接找新字节点头 ，在旧子节点中的对应位置
        const index = oldChildren.findIndex((c) => {
          return c && newStartVNode.key === c.key
        })
        if (index > 0) {
          //更新
          patch(oldChildren[index], newStartVNode, container)
          //旧子节点index处el插入到旧子节点头el前
          insert(oldChildren[index].el, container, oldStartVNode.el)
          //旧字节点index处置undefined
          oldChildren[index] = undefined
        } else {
          //添加新元素
          patch(null, newStartVNode, container, oldStartVNode.el)
        }
        //新子节点头指针进一
        newStartVNode = newChildren[++newStartIndex]
      }
    }
    //添加遗漏节点
    if (oldEndIndex < oldStartIndex && newEndIndex >= newStartIndex) {
      for (let i = newStartIndex; i <= newEndIndex; i++) {
        patch(null, newChildren[i], container, oldStartVNode.el)
      }
      //删除节点
    } else if (newEndIndex < newStartIndex && oldEndIndex >= oldStartIndex) {
      for (let i = oldStartIndex; i <= oldEndIndex; i++) {
        unmount(oldChildren[i])
      }
    }
  }
  //快速Diff
  function patchKedChildren3(n1, n2, container) {
    const oldChildren = n1.children
    const newChildren = n2.children
    //预处理
    let j = 0
    let oldVNode = oldChildren[j]
    let newVNode = newChildren[j]
    while (newVNode.key === oldVNode.key) {
      patch(oldVNode, newVNode, container)
      j++
      oldVNode = oldChildren[j]
      newVNode = newChildren[j]
    }
    let oldEndIndex = oldChildren.length - 1
    let newEndIndex = newChildren.length - 1
    oldVNode = oldChildren[oldEndIndex]
    newVNode = newChildren[newEndIndex]
    while (newVNode.key === oldVNode.key) {
      patch(oldVNode, newVNode, container)
      oldEndIndex--
      newEndIndex--
      oldVNode = oldChildren[oldEndIndex]
      newVNode = newChildren[newEndIndex]
    }
    //如果旧子节点已处理结束，新子节点没有，则新增
    if (oldEndIndex < j && newEndIndex >= j) {
      const anchorIndex = newEndIndex + 1
      const anchor =
        anchorIndex < newChildren.length ? newChildren[anchorIndex].el : null
      while (j <= newEndIndex) {
        patch(null, newChildren[j], container, anchor)
        j++
      }
      //如果新子节点已处理结束，旧子节点没有，则卸载全部未处理旧子节点
    } else if (newEndIndex < j && oldEndIndex >= j) {
      while (j <= oldEndIndex) {
        unmount(oldChildren[j++])
      }
      //处理交换位置
    } else {
      const count = newEndIndex - j + 1
      const source = new Array(count)
      source.fill(-1)

      const indexMap = {}
      const pos = 0
      const newStart = j
      const oldStart = j
      //indexMap存储形式{key,index}
      for (let i = newStart; i <= newEndIndex; i++) {
        indexMap[newChildren[i].key] = i
      }
      let patched = 0
      let move = false
      for (let i = oldStart; i <= oldEndIndex; i++) {
        const oldVNode = oldChildren[i]
        if (patched > count) {
          const k = indexMap[oldVNode.key]
          if (k) {
            const newVNode = newChildren[ind]
            patched++
            patch(oldVNode, newVNode, container)
            source[k - newStart] = i
            if (k < pos) {
              move = true
            } else {
              pos = k
            }
          } else {
            unmount(oldVNode)
          }
        } else {
          unmount(oldVNode)
        }
      }
      //递增子序列，不需移动
      const seq = getSequence(source)
      //s指向递增子序列最后
      let s = seq.length - 1
      //i指向需要移动的子节点最后
      let i = count - 1
      for (i; i >= 0; i--) {
        //等于-1说明是新增需要插入
        if (source[i] === -1) {
          //children中的位置
          const pos = i + newStart
          const anchorIndex = pos + 1
          const anchor = newChildren[anchorIndex]
            ? newChildren[anchorIndex].el
            : null
          patch(null, newChildren[pos], container, anchor)
          //i比当前seq指针位置小，说明i处的新子节点需要移到最后
        } else if (i !== seq[s]) {
          if (i < seq[s]) {
            const pos = i + newStart
            const anchorIndex = pos + 1
            const anchor = newChildren[anchorIndex]
              ? newChildren[anchorIndex].el
              : null
            insert(newChildren[pos].el, container, anchor)
            //节点一样s上移一位
          }
        } else {
          s--
        }
      }
    }
  }

  //n1旧vnode n2新vnode
  function patch(n1, n2, container, anchor) {
    if (n1 && n1.type !== n2.type) {
      unmount(n1)
      n1 = null
    }
    const type = typeof n2.type
    if (type === "string") {
      //普通节点
      if (!n1) {
        //n1为空说明是首次挂载
        mountElement(n2, container, anchor)
      } else {
        patchElement(n1, n2)
      }
      //组件节点
    } else if (type === "object") {
      if (!n1) {
        //n1为空说明是首次挂载
        mountComponent(n2, container, anchor)
      } else {
        patchComponent(n1, n2)
      }
    } else if (n2.type === Text) {
      if (!n1) {
        const el = (n2.el = document.createTextNode(n2.children))
        insert(el, container)
      } else {
        const el = (n2.el = n1.el)
        if (n2.children !== n1.children) {
          el.nodeValue = n2.children
        }
      }
    } else if (n2.type === Fragment) {
      if (!n1) {
        n2.children.forEach((vnode) => {
          mountElement(vnode, container, anchor)
        })
      } else {
        patchChildren(n1, n2, container, anchor)
      }
    }
  }
  function unmount(vnode) {
    if (typeof vnode.type === "object") {
      unmount(vnode.component.subTree)
      return 
    } else if (vnode.type === Fragment) {
      vnode.children.forEach((c) => unmount(c))
      return
    }
    const el = vnode.el
    const parent = el.parentNode
    parent.removeChild(el)
  }
  function render(vnode, container) {
    if (vnode) {
      //如果vnode存在，将其与旧vnode一起传递给patch,进行打补丁
      patch(container._vnode, vnode, container)
    } else {
      //如果不存在，说明是卸载操作
      // container.innerHTML = ""
      if (container._vnode) {
        unmount(container._vnode)
      }
    }
    //保存vnode为旧vnode
    container._vnode = vnode
    //...
  }
  return {
    render,
  }
}
