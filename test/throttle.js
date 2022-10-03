//节流

function throttle(fn,wait=50){
  let oldTime  = Date.now()
  return (...args)=>{
    const newTime = Date.now()
    if((newTime-oldTime)>wait){
      fn.apply(this,args)
      oldTime=newTime
    }
  }
}
function throttle2(fn,wait=50){
  let timer
  return (...args)=>{
    if(timer)return
    timer = setTimeout(()=>{
      fn.apply(this,args)
      timer=null
    },wait)
  }
}
const testThrottle = throttle2(()=>{
  console.log(this)
},500)

window.addEventListener('scroll',testThrottle)