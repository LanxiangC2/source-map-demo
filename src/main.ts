import './assets/main.css'
import ErrorStackParser from 'error-stack-parser'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { findCodeBySourcemap } from './utils'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.config.errorHandler = (err) => {
  const errorStack = ErrorStackParser.parse(err as Error)
  console.log('errorHandler', errorStack[0])
  findCodeBySourcemap(errorStack[0])
}

app.mount('#app')
