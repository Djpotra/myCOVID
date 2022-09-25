import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// import Map from '@/components/Map'
import Map from '@/components/Map.vue'
import Bar from '@/components/Bar.vue'
import Pie from '@/components/Pie.vue'

// import './assets/main.css'

const app = createApp(App)

app.use(router)
app.component(Map.name,Map);
app.component(Bar.name,Bar);
app.component(Pie.name,Pie);


app.mount('#app')
