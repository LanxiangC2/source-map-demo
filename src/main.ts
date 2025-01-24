import './assets/main.css'
import ErrorStackParser from 'error-stack-parser'
import { createApp, type ComponentInstance } from 'vue'
import { createPinia } from 'pinia'
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'

import App from './App.vue'
import router from './router'
import { findCodeBySourcemap } from './utils'

const app = createApp(App)
app.use(ElementPlus)
app.use(createPinia())
app.use(router)

app.config.errorHandler = (err: any, vm: ComponentInstance<any>) => {
  const errorStack = ErrorStackParser.parse(err as Error)
  // findCodeBySourcemap(errorStack[0])

  // 构建错误的调用栈

  const jsError = {
    stack_frames: errorStack,
    message: err.message,
    stack: err.stack,
    error_name: err.name,
  }

  vm!.$message.error(`触发了一个${err.name}错误`)
  localStorage.setItem('jsErrorList', JSON.stringify(jsError))
  console.log('jsErrorList 存到了 localStorage', jsError)
}

app.mount('#app')
