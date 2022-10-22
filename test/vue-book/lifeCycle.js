let currentInstance = null //当前实例
//设置当前实例
export function setCurrentInstance(ins) {
  currentInstance = ins
}

//unMounted生命周期
export function onUnmounted(fn) {
  if (currentInstance) {
    currentInstance.unmounted.push(fn)
  } else {
    console.error(`onUnmounted函数只能在setup中使用`)
  }
}
