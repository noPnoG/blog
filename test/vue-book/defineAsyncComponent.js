import { Text } from "./utils.js"
import { onUnmounted } from "./lifeCycle.js"
const { ref } = Vue
export default function defineAsyncComponent(options) {
  //存储异步组件
  let innerComp = null
  //如果option是函数说明直接返回组件，需要给它改造一下
  return {
    setup() {
      if (typeof options === "function") {
        options = {
          loader: options,
        }
      }
      const { loader } = options
      const loading = ref(false)
      let loadTimeout = null
      //延迟loading
      if (options.delay) {
        loadTimeout = setTimeout(() => {
          loading.value = true
        }, options.delay)
      }else{
        loading.value = true
      }
      if (options.timeout) {
        setTimeout(() => {
          error.value = new Error(`异步组件已超时${options.timeout}`)
        }, options.timeout)
      }
      const loaded = ref(false)
      const error = ref(null)
      loader()
        .then((comp) => {
          loaded.value = true
          innerComp = comp
        })
        .catch((e) => {
          error.value = e
        })
        .finally(() => {
          loading.value=false
          clearTimeout(loadTimeout)
        })
      const placeholder = { type: Text, children: "" }
      return () => {
        if (loaded.value) {
          return { type: innerComp }
        } else if (error.value && options.errorComp) {
          return {
            type: options.errorComp,
            props: {
              error: error.value,
            },
          }
        } else if (loading.value && options.loadingComp) {
          return { type: options.loadingComp }
        } else {
          return placeholder
        }
      }
    },
  }
}
