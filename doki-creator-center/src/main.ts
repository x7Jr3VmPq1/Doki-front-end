import { createApp } from 'vue'
import ArcoVue from '@arco-design/web-vue';
import App from './App.vue';
import { createPinia } from 'pinia'
import '@arco-design/web-vue/dist/arco.css';
import router from "./router/router.ts";
import { useUserStore } from './store/userStore.ts';

const pinia = createPinia()


const app = createApp(App);
app.use(ArcoVue).use(router);
app.use(pinia);

const userStore = useUserStore()
await userStore.fetchUserInfo()
app.mount('#app');
