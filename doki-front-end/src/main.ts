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


app.config.warnHandler = (msg, _, trace) => {
  if (msg.includes('_virtualUpdated')) return; // 忽略 Swiper 内部事件警告
  console.warn(msg, trace);                   // 其他警告正常显示
};


app.mount('#app');
