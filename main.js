import App from './App'
import { createSSRApp } from 'vue'
import * as Pinia from 'pinia'
import uviewPlus from 'uview-plus'

export function createApp() {
  const app = createSSRApp(App)
  
  // 使用Pinia状态管理
  const store = Pinia.createPinia()
  app.use(store)
  
  // 使用uView UI
  app.use(uviewPlus)
  
  return {
    app,
    Pinia
  }
}
