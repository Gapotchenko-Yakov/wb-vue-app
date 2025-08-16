<template>
  <canvas ref="chartRef"></canvas>
</template>

<script>
import { onMounted, ref, watch, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export default {
  name: 'LineChart',
  props: {
    chartData: { type: Object, required: true }
  },
  setup(props) {
    const chartRef = ref(null);
    let chartInstance = null;

    const renderChart = async () => {
      if (!chartRef.value) return;

      if (chartInstance) {
        chartInstance.destroy();
      }
      chartInstance = new Chart(chartRef.value.getContext('2d'), {
        type: 'line',
        data: props.chartData,
        options: { responsive: true, maintainAspectRatio: false },
      });
    };

    onMounted(renderChart);
    watch(() => props.chartData, renderChart, { deep: true });

    return { chartRef };
  },
};
</script>

<style>
canvas {
  width: 100%;
  height: 300px;
}
</style>
