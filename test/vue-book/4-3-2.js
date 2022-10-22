// const bucket = new Set()
const bucket = new WeakMap()

//当前副作用函数
let activeEffect

const data = { text: "hello world" }
const obj = new Proxy(data, {
  get(target, key) {
    //如果当前副作用函数存在，则将他存入“桶”中
    // if(activeEffect){
    //   bucket.add(activeEffect)
    // }
    if(!activeEffect)return target[key]
    //depsMap存放target下的map
    let depsMap = bucket.get(target)
    if (!depsMap) {
      bucket.set(target, (depsMap = new Map()))
    }
    //deps存放key下收集的副作用函数
    let deps = depsMap.get(key)
    if (!deps) {
      depsMap.set(key, (deps = new Set()))
    }
    deps.add(activeEffect)
    return target[key]
  },
  set(target, key, newVal) {
    target[key] = newVal
    // bucket.forEach((fn) => fn())
    const depsMap = bucket.get(target)
    const deps = depsMap && depsMap.get(key)
    deps && deps.forEach((fn) => {
      fn()
    })
    return true
  },
})

//effect函数用于注册副作用函数
function effect(fn) {
  //将全局变量赋值为副作用函数
  activeEffect = fn
  //执行副作用函数
  fn()
  //清空全局变量
  activeEffect = undefined
}

effect( () => {
  console.log(obj.text)
})
setTimeout(() => {
  obj.text = "i changed"
}, 1000)

setTimeout(() => {
  obj.noExit = "i no changed"
}, 1000)
