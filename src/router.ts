import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import IncomesPage from './pages/IncomesPage.vue';
import OrdersPage from './pages/OrdersPage.vue';
import SalesPage from './pages/SalesPage.vue';
import StocksPage from './pages/StocksPage.vue';

type MyRoute = RouteRecordRaw & {
    meta: {
        label?: string;
    };
}

export const routes: Array<MyRoute> = [
    { path: '/', component: IncomesPage, meta: {} },
    { path: '/incomes', component: IncomesPage, meta: { label: 'Доходы' } },
    { path: '/orders', component: OrdersPage, meta: { label: 'Заказы' } },
    { path: '/sales', component: SalesPage, meta: { label: 'Продажи' } },
    { path: '/stocks', component: StocksPage, meta: { label: 'Склады' } },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
