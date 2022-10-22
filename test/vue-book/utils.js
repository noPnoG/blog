export function getSequence(arr) {
  const p = arr.slice()
  const result = [0]
  let i, j, u, v, c
  const len = arr.length
  for (i = 0; i < len; i++) {
    const arrI = arr[i]
    if (arrI !== 0) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }
      u = 0
      v = result.length - 1
      while (u < v) {
        c = ((u + v) / 2) | 0
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }
  u = result.length
  v = result[u - 1]
  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }
  return result
}

//任务调度

//用来缓存任务
const queue = new Set()
//判断当前是否在刷新
let isFlushing = false
const p = Promise.resolve()
export function queueJob(job) {
  //添加job
  console.log(job)
  queue.add(job)
  //如果不在刷新则进行刷新
  if (!isFlushing) {
    isFlushing = true
    //利用微任务进行异步刷新
    p.then(() => {
      try {
        queue.forEach((job) => job())
      } finally {
        //重置状态
        isFlushing = false
        queue.length = 0
      }
    })
  }
}

//解析props
export function resolveProps(options={}, propsData={}) {
  const props = {}
  const attrs = {}
  for (let key in propsData) {
    if (key in options || key.startsWith("on")) {
      props[key] = propsData[key]
    } else {
      attrs[key] = propsData[key]
    }
  }
  return [props, attrs]
}

//判断props是否改变

export function hasPropsChange(prevProps, nextProps) {
  const nextKeys = Object.keys(nextProps)
  if (nextKeys.length !== Object.keys(prevProps).length) return true

  for (let key in nextKeys) {
    if (prevProps[key] !== nextProps[key]) return true
  }
  return false
}


export const Fragment = Symbol()
export const Text = Symbol()