<template>
  <n-space vertical>
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
      :data="filteredStocks"
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
import { NDataTable, NInput, NPagination, NSpace } from 'naive-ui';
import { computed, onMounted, ref, watch } from 'vue';
import { getStocks } from '../api/stocks';
import type { Stock } from '../api/types';
import LineChart from '../components/LineChart.vue';

const pagedStocks = ref<Stock[]>([]); // for table
const totalStocks = ref<Stock[]>([]); // for chart

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

const filteredStocks = computed(() => {
  const filteredData = pagedStocks.value.filter((item: Stock) => {
    return (!filters.value.supplier_article || String(item.supplier_article).includes(filters.value.supplier_article))
      && (!filters.value.warehouse_name || String(item.warehouse_name).includes(filters.value.warehouse_name))
      && (!filters.value.barcode || String(item.barcode).includes(filters.value.barcode))
      // && (!filters.value.total_price || item.total_price === Number(filters.value.total_price))
  })
  return filteredData;
})

watch([filteredStocks, pageSize], () => {
  const hasFilters = Object.values(filters.value).some(v => v !== '' && v !== null && v !== undefined);
  if(hasFilters) {
    filteredPageCount.value = Math.ceil(filteredStocks.value.length / pageSize.value);
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

const today = dayjs().format('YYYY-MM-DD');


const fetchPagedStocks = async () => {
  const result = await getStocks({
    page: currentPage.value,
    limit: pageSize.value,
    dateFrom: today,
  })
  pagedStocks.value = result.data;
  apiPageCount.value = result.meta.last_page;
  filteredPageCount.value = result.meta.last_page;
}

const fetchTotalStocks = async () => {
  const result = await getStocks({
    dateFrom: today,
  })
  totalStocks.value = result.data;
}

onMounted(async () => {
    await fetchPagedStocks();
    await fetchTotalStocks();
});

// TODO: deduplicate queries via pinia query 
watch([currentPage], async () => {
  await fetchPagedStocks();
})

const chartData = computed(() => {
  const grouped: Record<string, { sum: number; count: number }> = {};

  totalStocks.value.forEach(item => {
    const month = dayjs(item.date).format('MM')
    if (!grouped[month]) grouped[month] = { sum: 0, count:0 };
    grouped[month].sum += Number(item.quantity);
    grouped[month].count += 1;
  });

  const allMonths = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const labels = allMonths.map(m => dayjs(m, 'MM').format('MMMM'));
  const data = allMonths.map(m => grouped[m] ? grouped[m].sum / grouped[m].count : 0);

  return {
    labels,
    datasets: [
      {
        label: 'Итоговое количество по месяцам',
        data,
        borderColor: '#3b82f6',
        backgroundColor: '#93c5fd',
      },
    ],
  };
});
</script>
