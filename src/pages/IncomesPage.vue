<template>
  <n-space vertical>
    <!-- Фильтр по дате -->
    <n-date-picker v-model:value="dateFilter" type="daterange" placeholder="Выберите дату" />

    <!-- График -->
    <LineChart v-if="chartData" :chart-data="chartData" />

    <!-- Таблица -->
    <n-data-table
      :columns="columns" 
      :data="incomes"
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

export default {
  components: { NDataTable, NDatePicker, NSpace, NPagination, LineChart },
  setup() {
    const incomes = ref([]);
    const dateFilter = ref([
      new Date('2023-01-01'),
      new Date('2025-01-01'),
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


    const fetchIncomes = async () => {
      const [start, end] = dateFilter.value || [];
      const result = await getIncomes({
        page: currentPage.value,
        limit: pageSize.value,
        dateFrom: start ? dayjs(start).format('YYYY-MM-DD') : undefined,
        dateTo: end ? dayjs(end).format('YYYY-MM-DD') : undefined,
      })
      incomes.value = result.data;
      pageCount.value = result.meta.last_page;
    }

    onMounted(async () => {
      if(dateFilter.value){
        await fetchIncomes();
      }
    });

    // TODO: deduplicate queries via pinia query 
    watch([dateFilter, currentPage], async () => {
      await fetchIncomes();
    })

    const chartData = computed(() => ({
      labels: incomes.value.map(i => i.date),
      datasets: [
        {
          label: 'Количество',
          data: incomes.value.map(i => Number(i.quantity)), // total_price из API
          borderColor: '#3b82f6',
          backgroundColor: '#93c5fd',
        },
      ],
    }));

    return { dateFilter, columns, incomes, currentPage, pageCount, pageSize, chartData };
  },
};
</script>
