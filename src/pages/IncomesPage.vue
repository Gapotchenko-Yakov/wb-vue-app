<template>
  <n-space vertical>
    <!-- Фильтр по дате -->
    <n-date-picker v-model:value="dateFilter" type="daterange" placeholder="Выберите дату" />

    <!-- График -->
    <LineChart v-if="chartData" :chart-data="chartData" />

    <!-- Таблица -->
    <n-data-table
      :columns="columns" 
      :data="pagedIncomes"
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

<script>
import { ref, onMounted, computed, watch } from 'vue';
import { getIncomes } from '../api/incomes';
import { NDataTable, NDatePicker, NSpace, NPagination } from 'naive-ui';
import  LineChart  from '../components/LineChart.vue';
import dayjs from 'dayjs';
import { MAX_API_DATE, MIN_API_DATE } from '../const/api';

export default {
  components: { NDataTable, NDatePicker, NSpace, NPagination, LineChart },
  setup() {
    const pagedIncomes = ref([]); // for table
    const totalIncomes = ref([]); // for chart
    const dateFilter = ref([
      new Date(MIN_API_DATE),
      new Date(MAX_API_DATE),
    ]);

    const currentPage = ref(1);
    const pageSize = ref(10);
    const pageCount = ref(1);

    // Колонки таблицы соответствуют полям API
    const columns = [
      { title: 'Дата', key: 'date' },
      { title: 'Сумма', key: 'total_price' },
      { title: 'Товар', key: 'supplier_article' },
      { title: 'Штрихкод', key: 'barcode' },
      { title: 'Склад', key: 'warehouse_name' },
      { title: 'Количество', key: 'quantity' },
    ];


    const fetchPagedIncomes = async () => {
      const [start, end] = dateFilter.value || [];
      const result = await getIncomes({
        page: currentPage.value,
        limit: pageSize.value,
        dateFrom: start ? dayjs(start).format('YYYY-MM-DD') : undefined,
        dateTo: end ? dayjs(end).format('YYYY-MM-DD') : undefined,
      })
      pagedIncomes.value = result.data;
      pageCount.value = result.meta.last_page;
    }

    const fetchTotalIncomes = async () => {
      const result = await getIncomes({
        dateFrom: dayjs(MIN_API_DATE).format('YYYY-MM-DD'),
        dateTo: dayjs(MAX_API_DATE).format('YYYY-MM-DD'),
      })
      totalIncomes.value = result.data;
    }

    onMounted(async () => {
      if(dateFilter.value){
        await fetchPagedIncomes();
        await fetchTotalIncomes();
      }
    });

    // TODO: deduplicate queries via pinia query 
    watch([dateFilter, currentPage], async () => {
      await fetchPagedIncomes();
    })

    const chartData = computed(() => ({
      labels: totalIncomes.value.map(i => i.date),
      datasets: [
        {
          label: 'Количество',
          data: totalIncomes.value.map(i => Number(i.quantity)), // total_price из API
          borderColor: '#3b82f6',
          backgroundColor: '#93c5fd',
        },
      ],
    }));

    return { dateFilter, columns, totalIncomes, pagedIncomes, currentPage, pageCount, pageSize, chartData };
  },
};
</script>
