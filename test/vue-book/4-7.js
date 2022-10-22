// const bucket = new Set()
const bucket = new WeakMap()
//副作用函数栈
const effectFnStack =[]
//当前副作用函数
let activeEffect

const data = { for:1 }

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
  //将“桶”与副作用函数进行关联
  activeEffect.deps.push(deps)
}

function trigger(target, key) {
  const depsMap = bucket.get(target)
  const effects = depsMap && depsMap.get(key)
  const effectToRun = new Set()
  effects&&effects.forEach((effect)=>{
    if(effect!==activeEffect){
      effectToRun.add(effect)
    }
  })
  effectToRun.forEach((fn)=>{
    if(fn.options.scheduler){
      fn.options.scheduler(fn)
    }else{
      fn()
    }
  })
}
function cleanup(effectFn){
  const deps = effectFn.deps
  deps.forEach((dep)=>{
    dep.delete(effectFn)
  })
  effectFn.deps.length = 0
}
//effect函数用于注册副作用函数
function effect(fn,options) {
  const effectFn=()=>{
    //每次触发都进行清除
    cleanup(effectFn)
    activeEffect = effectFn
    effectFnStack.push(effectFn)
    fn()
    //将当前函数副作用执行完完毕后，将当前副作用函数弹出栈，并把activeEffect还原为之前的值
    effectFnStack.pop()
    activeEffect = effectFnStack[effectFnStack.length-1]
  }
  //用于存储副作用函数关联的所在的“桶”
  effectFn.deps = []
  effectFn.options = options
  effectFn()
}
//用set去除重复项
const jobQueue =  new Set()
//使用微任务
const p = Promise.resolve()
//判断当前是否在刷新
let isFlushing = false

function flushJob(){
  //正在刷新，返回
  if(isFlushing) return 
  isFlushing = true
  p.then(()=>{
    jobQueue.forEach((job)=>job())
  }).finally(()=>{
    isFlushing= false
  })

}

effect(()=>{
  console.log(obj.for)
},{
  scheduler:(fn)=>{
    jobQueue.add(fn)
    flushJob()
  }
})


obj.for++
obj.for++ 
