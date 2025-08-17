<!--
 TODO: use this component for 4 pages
-->
<template>
  <n-space vertical>
    <!-- Фильтр по дате -->
    <n-date-picker v-model:value="dateFilter" type="daterange" placeholder="Выберите дату" />

    <n-space vertical >
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
        <!-- <n-input 
          v-model:value="filters.total_price"
          placeholder="Сумма"
          type="number"
          clearable
        /> -->
    </n-space>

    <!-- График -->
    <LineChart v-if="chartData" :chart-data="chartData" />

    <!-- Таблица -->
    <n-data-table
      :columns="columns" 
      :data="filteredData"
      :pagination="false" 
    />

    <!-- Пагинация -->
    <n-pagination
      v-model:page="currentPage"
      :page-count="pageCount"
      :page-size="pageSize"
    />
  </n-space>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { ref, computed, onMounted, watch } from 'vue';
import { NDataTable, NDatePicker, NInput, NPagination, NSpace, type DataTableColumn } from 'naive-ui';
import LineChart from '../components/LineChart.vue';
import { MAX_API_DATE, MIN_API_DATE } from '../const/api';
import { type FilterFields, type GetDataFn, type Incomes, type Orders, type Sales, type Stocks } from '../api/types';

type Data = Incomes | Orders | Sales | Stocks;

const props = defineProps<{
  columns: DataTableColumn[];
  getData: GetDataFn<any>;
  filterFields?: FilterFields;
  fieldForChart: string;
  nameForChart: string;
}>();

const { columns, getData, filterFields, fieldForChart, nameForChart } = props;

const pagedData = ref<Data>([]);
const totalData = ref<Data>([]);
const dateFilter = ref<[number, number]>([
  new Date(MIN_API_DATE).getTime(),
  new Date(MAX_API_DATE).getTime(),
]);

const filters = ref({
  supplier_article: '',
  warehouse_name: '',
  barcode: '',
});

const currentPage = ref(1);
const pageSize = ref(10);
const pageCount = ref(1);

const filteredData = computed(() => {
  return pagedData.value.filter((item) => {
    return (!filters.value.supplier_article || item.supplier_article.includes(filters.value.supplier_article))
      && (!filters.value.warehouse_name || item.warehouse_name.includes(filters.value.warehouse_name))
      && (!filters.value.barcode || item.barcode.includes(filters.value.barcode));
  });
});

const chartData = computed(() => ({
  labels: totalData.value.map(i => i.date),
  datasets: [
    {
      label: nameForChart,
      // @ts-ignore
      data: totalData.value.map(i => Number(i[fieldForChart])),
      borderColor: '#3b82f6',
      backgroundColor: '#93c5fd',
    },
  ],
}));

const fetchPagedData = async () => {
  const [start, end] = dateFilter.value || [];
  const result = await getData({
    page: currentPage.value,
    limit: pageSize.value,
    dateFrom: start ? dayjs(start).format('YYYY-MM-DD') : undefined,
    dateTo: end ? dayjs(end).format('YYYY-MM-DD') : undefined,
  });
  pagedData.value = result.data;
  pageCount.value = result.meta.last_page;
};

const fetchTotalData = async () => {
  const result = await getData({
    dateFrom: dayjs(MIN_API_DATE).format('YYYY-MM-DD'),
    dateTo: dayjs(MAX_API_DATE).format('YYYY-MM-DD'),
  });
  totalData.value = result.data;
};

onMounted(async () => {
  if (dateFilter.value) {
    await fetchPagedData();
    await fetchTotalData();
  }
});

watch([dateFilter, currentPage], async () => {
  await fetchPagedData();
});
</script>
