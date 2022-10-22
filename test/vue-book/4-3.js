// const bucket = new Set()
const bucket = new WeakMap()

//当前副作用函数
let activeEffect

const data = { text: "hello world",ok:true }

const obj = new Proxy(data, {
  get(target, key) {
    //如果当前副作用函数存在，则将他存入“桶”中
    // if(activeEffect){
    //   bucket.add(activeEffect)
    // }
    track(target, key)
    return target[key]
  },
  set(target, key, newVal) {
    target[key] = newVal
    // bucket.forEach((fn) => fn())
    trigger(target, key)
  },
})
//追踪
function track(target, key) {
  if (!activeEffect) return
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
}

function trigger(target, key) {
  const depsMap = bucket.get(target)
  const deps = depsMap && depsMap.get(key)
  deps &&
    deps.forEach((fn) => {
      fn()
    })
}
//effect函数用于注册副作用函数
function effect(fn) {
  //将全局变量赋值为副作用函数
  activeEffect = fn
  //执行副作用函数
  fn()
  //清空全局变量
  activeEffect = undefined
}


let time = 1
effect(()=>{
  document.body.innerText = obj.ok?obj.text:'hello'
  console.log(time++)
})
setTimeout(()=>{
  obj.ok = false
  obj.text = 'no'
},1000)


