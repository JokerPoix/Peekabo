<template>
    <div class="stats-board-page">
      <StatsBoard />
      <TokenChart :stats="stats" />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import StatsBoard from '@/components/StatsBoard.vue';
  import TokenChart from '@/components/TokenChart.vue';
  
  const stats = ref([]);
  
  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/stats');
      stats.value = response.data;
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };
  
  onMounted(() => {
    fetchStats();
  });
  </script>
  
  <style scoped>
  .stats-board-page {
    padding: 20px;
  }
  </style>