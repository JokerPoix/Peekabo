<template>
  <div>
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

interface Stat {
  stats_id: number;
  session_id: string;
  total_requests: number;
  total_tokens: number;
  avg_latency: number;
  role_tag: string;
  ressource_tag: string;
  id_s3_aws: string;
}

const props = defineProps<{ stats: Stat[] }>();

const chartData = ref({
  labels: props.stats.map(stat => stat.stats_id),
  datasets: [
    {
      label: 'Total Tokens',
      backgroundColor: '#42A5F5',
      data: props.stats.map(stat => stat.total_tokens)
    }
  ]
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      title: {
        display: true,
        text: 'Stats ID'
      }
    },
    y: {
      title: {
        display: true,
        text: 'Total Tokens'
      }
    }
  }
});

watch(() => props.stats, (newStats) => {
  chartData.value.labels = newStats.map(stat => stat.stats_id);
  chartData.value.datasets[0].data = newStats.map(stat => stat.total_tokens);
});
</script>

<style scoped>
div {
  height: 400px;
}
</style>