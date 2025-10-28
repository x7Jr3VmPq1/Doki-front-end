import { createApp } from 'vue'
import { createPinia } from 'pinia';
import App from './App.vue'
import Antd from 'ant-design-vue';

import router from "./router";
import 'ant-design-vue/dist/reset.css';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import './assets/style.css'



// @ts-ignore
import { RecycleScroller } from 'vue-virtual-scroller'
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router);
app.use(Antd)

app.mount('#app');
