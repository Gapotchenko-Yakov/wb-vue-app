<template>
  <entity-chart-table 
    :getData="getOrders"
    :filterFields="filterFields"
    fieldForChart="total_price"
    nameForChart="Полная цена"
    :columns="columns"
  />
</template>

<script setup lang="ts">
import { getOrders } from '../api/orders';
import type { FilterFields } from '../api/types';
import EntityChartTable from '../components/EntityChartTable.vue';

const filterFields: FilterFields = [
  {
    code: 'supplier_article',
    type: 'text',
    placeholder: 'Товар',
    clearable: true,
    defaultValue: ''
  },
  {
    code: 'warehouse_name',
    type: 'text',
    placeholder: 'Склад',
    clearable: true,
    defaultValue: ''
  },
  {
    code: 'barcode',
    type: 'text',
    placeholder: 'Штрихкод',
    clearable: true,
    defaultValue: ''
  },
  {
    code: 'total_price',
    type: 'number',
    placeholder: 'Сумма',
    clearable: true,
    defaultValue: 0
  }
];

const columns = [
  { title: 'Дата', key: 'date' },
  { title: 'Сумма', key: 'total_price' },
  { title: 'Товар', key: 'supplier_article' },
  { title: 'Штрихкод', key: 'barcode' },
  { title: 'Склад', key: 'warehouse_name' },
  { title: 'Количество', key: 'quantity' },
];
</script>
