import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import IncomesPage from './pages/IncomesPage.vue';
// TODO: OrdersPage, SalesPage, StocksPage

const routes: Array<RouteRecordRaw> = [
    { path: '/', component: IncomesPage },
    { path: '/incomes', component: IncomesPage },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
