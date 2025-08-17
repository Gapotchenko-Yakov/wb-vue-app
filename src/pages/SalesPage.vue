<template>
  <n-space vertical>
    <!-- Фильтр по дате -->
    <n-date-picker v-model:value="dateFilter" type="daterange" placeholder="Выберите дату" />

    <n-space vertical>
      <!-- Фильтры -->
      <n-input
        v-model:value="filters.supplier_article"
        placeholder="Товар"
        clearable
      />
      <n-input
        v-model:value="filters.warehouse_name"
        placeholder="Склад"
        clearable
      />
      <n-input
        v-model:value="filters.barcode"
        placeholder="Штрихкод"
        clearable
      />
      <!-- <n-input-number
        v-model:value="filters.total_price"
        placeholder="Сумма"
        clearable
      /> -->
    </n-space>

    <!-- График -->
    <LineChart v-if="chartData" :chart-data="chartData" />

    <!-- Таблица -->
    <n-data-table
      :columns="columns" 
      :data="filteredSales"
      :pagination="false" 
    />

    <!-- Пагинация -->
    <div style="display: flex; justify-content: center; margin-top: 16px;">
      <n-pagination
        v-model:page="currentPage"
        :page-count="filteredPageCount"
        :page-size="pageSize"
      />
    </div>
  </n-space>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { NDataTable, NDatePicker, NInput, NPagination, NSpace } from 'naive-ui';
import { computed, onMounted, ref, watch } from 'vue';
import { getSales } from '../api/sales';
import type { Sale } from '../api/types';
import LineChart from '../components/LineChart.vue';
import { MAX_API_DATE, MIN_API_DATE } from '../const/api';

const pagedSales = ref<Sale[]>([]); // for table
const totalSales = ref<Sale[]>([]); // for chart
const dateFilter = ref<[number, number]>([
  new Date(MIN_API_DATE).getTime(),
  new Date(MAX_API_DATE).getTime(),
]);

const filters = ref({
  supplier_article: '',
  warehouse_name: '',
  barcode: '',
  // total_price: '',
})

const currentPage = ref(1);
const pageSize = ref(10);
const apiPageCount = ref(1);
const filteredPageCount = ref(1);

const filteredSales = computed(() => {
  const filteredData = pagedSales.value.filter((item: Sale) => {
    return (!filters.value.supplier_article || String(item.supplier_article).includes(filters.value.supplier_article))
      && (!filters.value.warehouse_name || String(item.warehouse_name).includes(filters.value.warehouse_name))
      && (!filters.value.barcode || String(item.barcode).includes(filters.value.barcode))
      // && (!filters.value.total_price || item.total_price === Number(filters.value.total_price))
  })
  return filteredData;
})

watch([filteredSales, pageSize], () => {
  const hasFilters = Object.values(filters.value).some(v => v !== '' && v !== null && v !== undefined);
  if(hasFilters) {
    filteredPageCount.value = Math.ceil(filteredSales.value.length / pageSize.value);
    if(currentPage.value > filteredPageCount.value) currentPage.value = filteredPageCount.value || 1;
  }
})

// Колонки таблицы соответствуют полям API
const columns = [
  { title: 'Дата', key: 'date' },
  { title: 'Сумма', key: 'total_price' },
  { title: 'Товар', key: 'supplier_article' },
  { title: 'Штрихкод', key: 'barcode' },
  { title: 'Склад', key: 'warehouse_name' },
  { title: 'Количество', key: 'quantity' },
];

const fetchPagedSales = async () => {
  const [start, end] = dateFilter.value || [];
  const result = await getSales({
    page: currentPage.value,
    limit: pageSize.value,
    dateFrom: start ? dayjs(start).format('YYYY-MM-DD') : undefined,
    dateTo: end ? dayjs(end).format('YYYY-MM-DD') : undefined,
  })
  pagedSales.value = result.data;
  apiPageCount.value = result.meta.last_page;
  filteredPageCount.value = result.meta.last_page;
}

const fetchTotalSales = async () => {
  const result = await getSales({
    dateFrom: dayjs(MIN_API_DATE).format('YYYY-MM-DD'),
    dateTo: dayjs(MAX_API_DATE).format('YYYY-MM-DD'),
  })
  totalSales.value = result.data;
}

onMounted(async () => {
  if(dateFilter.value){
    await fetchPagedSales();
    await fetchTotalSales();
  }
});

// TODO: deduplicate queries via pinia query 
watch([dateFilter, currentPage], async () => {
  await fetchPagedSales();
})

const chartData = computed(() => {
  const grouped: Record<string, { sum: number; count: number }> = {};

  totalSales.value.forEach(item => {
    const month = dayjs(item.date).format('MM')
    if (!grouped[month]) grouped[month] = { sum: 0, count:0 };
    grouped[month].sum += Number(item.total_price);
    grouped[month].count += 1;
  });

  const allMonths = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const labels = allMonths.map(m => dayjs(m, 'MM').format('MMMM'));
  const data = allMonths.map(m => grouped[m] ? grouped[m].sum / grouped[m].count : 0);

  return {
    labels,
    datasets: [
      {
        label: 'Средняя цена по месяцам',
        data,
        borderColor: '#3b82f6',
        backgroundColor: '#93c5fd',
      },
    ],
  };
});
</script>
