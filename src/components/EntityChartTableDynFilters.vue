<!--
 TODO: use this component for 4 pages
-->
<template>
  <n-space vertical>
    <!-- Фильтр по дате -->
    <n-date-picker v-model:value="dateFilter" type="daterange" placeholder="Выберите дату" />

    <n-space vertical >
      <!-- Фильтры -->
       <template v-for="filter in filterFields" :key="filter.code">
        <n-input-number
          v-model:value="filters[filter.code]"
          :placeholder="filter.placeholder"
          :clearable="filter.clearable"
          v-if="filter.type === 'number'"
        />
        <n-input
          v-model:value="filters[filter.code]"
          :placeholder="filter.placeholder"
          :clearable="filter.clearable"
          v-else
        />
        </template>
        <!-- <n-input
          v-model:value="filters.warehouse_name"
          placeholder="Склад"
          clearable
        />
        <n-input
          v-model:value="filters.barcode"
          placeholder="Штрихкод"
          clearable
        />
        <n-input 
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
import { NDataTable, NDatePicker, NInputNumber, NInput, NPagination, NSpace, type DataTableColumn } from 'naive-ui';
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

const filters = ref<Record<string, string | number>>({});

if (filterFields) {
  for (const field of filterFields) {
    filters.value[field.code] = field.defaultValue ?? '';
  }
}

const currentPage = ref(1);
const pageSize = ref(10);
const pageCount = ref(1);

const filteredData = computed(() => {
  return pagedData.value.filter((item) => {
    return filterFields?.every((filter) => {
      const filterVal = filters.value[filter.code];

      if (filterVal === null || filterVal === undefined || filterVal === '') {
        return true;
      }

      if (filter.type === "number") {
        return Number(item[filter.code]) === Number(filterVal);
      } else {
        return String(item[filter.code]).includes(String(filterVal));
      }
    }) ?? true;
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
