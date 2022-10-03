//防抖

// 多次触发只执行最后一次

function debounce(fn, wait) {
  let timer
  return function (...args) {
    if (timer)clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(...args)
    }, wait)
  }
}

const testDebounce = debounce(()=>{
  console.log(1)
},500)

window.addEventListener('scroll',testDebounce)
