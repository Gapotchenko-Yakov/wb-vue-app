<template>
  <n-config-provider>
    <router-view />
  </n-config-provider>
</template>

<script>
import { NConfigProvider } from 'naive-ui';

export default {
  components: {
    NConfigProvider
  }
};
</script>

<style>
body {
  margin: 0;
  font-family: 'Inter', sans-serif;
}
</style>
