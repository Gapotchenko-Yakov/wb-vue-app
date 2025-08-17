<template>
  <n-config-provider>
    <nav-bar />
    <div style="margin-top: 64px;">
      <router-view />
    </div>
  </n-config-provider>
</template>

<script>
import { NConfigProvider } from 'naive-ui';
import NavBar from './components/NavBar.vue';


export default {
  components: {
    NConfigProvider, NavBar,
  }
};
</script>

<style>
body {
  margin: 0;
  font-family: 'Inter', sans-serif;
}
</style>
