<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const chartRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

// Data for the graph
const treeData = ref([]);
const depthLevel = ref(3); // Default depth level

// Fetch data from the API and process it for the graph
const fetchTreeData = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/admin/prompts?depthLevel=${depthLevel.value}`);
    const prompts = response.data;

    // Transform the data into a format suitable for the graph
    treeData.value = prompts.map((usage: any) => ({
      label: usage.usage_key,
      data: usage.applications.map((app: any) => ({
        label: app.application_name,
        data: app.compte.map((compte: any) => ({
          label: compte.compte_name,
          value: compte.prompts.length
        }))
      }))
    }));

    updateGraph();
  } catch (error) {
    console.error('Error fetching tree data:', error);
  }
};

// Initialize or update the graph
const updateGraph = () => {
  if (!chartRef.value) return;

  const labels = treeData.value.map((usage: any) => usage.label);
  const data = treeData.value.map((usage: any) =>
    usage.data.reduce((sum: number, app: any) => sum + app.data.reduce((subSum: number, compte: any) => subSum + compte.value, 0), 0)
  );

  if (chartInstance) {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = data;
    chartInstance.update();
  } else {
    chartInstance = new Chart(chartRef.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Number of Prompts',
            data,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true
          }
        }
      }
    });
  }
};

// Fetch data on component mount
onMounted(() => {
  fetchTreeData();
});

// Watch for changes in depth level and refetch data
watch(depthLevel, fetchTreeData);
</script>

<template>
  <div class="prompt-uploader">
    <h2>Prompt Graph</h2>

    <!-- Input for Depth Level -->
    <div class="depth-input">
      <label for="depth-level">Depth Level:</label>
      <input v-model="depthLevel" type="number" id="depth-level" min="1" placeholder="Enter Depth Level" />
    </div>

    <!-- Graph Container -->
    <div class="graph-container">
      <canvas ref="chartRef"></canvas>
    </div>
  </div>
</template>

<style scoped>
.prompt-uploader {
  margin-top: 20px;
}

.depth-input {
  margin-bottom: 20px;
}

.graph-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}
</style>