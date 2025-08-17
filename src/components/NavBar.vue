<template>
    <n-space>
    <router-link
        v-for="link in navLinks"
        :key="link.path"
        :to="link.path"
        style="text-decoration: none;"
    >
        <n-button
        :tertiary="currentRoute.path !== link.path"
        :type="currentRoute.path === link.path ? 'primary' : 'default'"
        >
        {{ link.meta.label }}
        </n-button>
    </router-link>
    </n-space>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { NButton, NSpace } from 'naive-ui';
import { routes } from '../router';


const currentRoute = useRoute();

const navLinks = routes.filter(r => r.meta?.label);
</script>
