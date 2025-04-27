<template>
  <div v-if="!$route.meta.fullPage">
    <a-space direction="vertical" :style="{ width: '100%' }" :size="[0, 48]">
      <a-layout>
        <a-layout>
          <a-layout-sider :style="siderStyle">
            <!--侧边导航-->
            <NavSide></NavSide>
          </a-layout-sider>
          <a-layout-content :style="contentStyle">
            <!-- 一级路由出口-->
            <router-view :key="$route.fullPath"/>
          </a-layout-content>
        </a-layout>
      </a-layout>
    </a-space>
  </div>
  <div v-else>
    <router-view/>
  </div>
</template>
<script lang="ts" setup>
import type {CSSProperties} from 'vue';
import NavSide from "./components/NavSide.vue";

const contentStyle: CSSProperties = {
  display: 'flex',
  textAlign: 'center',
  minHeight: 120,
  lineHeight: '120px',
  color: '#fff',
  backgroundColor: '#ffffff',
  justifyContent: 'center'
};

const siderStyle: CSSProperties = {
  textAlign: 'center',
  lineHeight: '120px',
  color: '#fff',
  backgroundColor: '#ffffff',
};

</script>
<style>

</style>
