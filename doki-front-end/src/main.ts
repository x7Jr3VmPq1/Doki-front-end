import {createApp} from 'vue'
import {createPinia} from 'pinia';
import App from './App.vue'
import Antd from 'ant-design-vue';

import router from "./router";
import 'ant-design-vue/dist/reset.css';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
// @ts-ignore
import {RecycleScroller} from 'vue-virtual-scroller'


createApp(App).component('RecycleScroller', RecycleScroller).use(Antd).use(router).use(createPinia()).mount('#app');
