const bucket = new Set()
const data = { text:"hello world"}
const obj = new Proxy(data,{
  get(target,key){
    bucket.add(effect)
    return target[key]
  },
  set(target,key,newVal){
    target[key] = newVal
    bucket.forEach(fn=>fn())
    return true
  }
})
function effect(){
  console.log(obj.text)
}
effect()
setTimeout(() => {
    obj.text = 'i changed'
}, 1000)
