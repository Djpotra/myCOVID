import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// import Map from '@/components/Map'
import Map from '@/components/Map.vue'

import './assets/main.css'

const app = createApp(App)

app.use(router)
app.component(Map.name,Map);

app.mount('#app')
