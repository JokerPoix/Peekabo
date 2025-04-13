<template>
    <div class="stats-board">
      <h2>Chatbot Consumption Statistics</h2>
      <table>
        <thead>
          <tr>
            <th>Session ID</th>
            <th>Total Requests</th>
            <th>Total Tokens</th>
            <th>Avg Latency</th>
            <th>Role Tag</th>
            <th>Resource Tag</th>
            <th>ID S3 AWS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="stat in stats" :key="stat.stats_id">
            <td>{{ stat.session_id }}</td>
            <td>{{ stat.total_requests }}</td>
            <td>{{ stat.total_tokens }}</td>
            <td>{{ stat.avg_latency }}</td>
            <td>{{ stat.role_tag }}</td>
            <td>{{ stat.ressource_tag }}</td>
            <td>{{ stat.id_s3_aws }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  
  const stats = [
  {
    "stats_id": 1,
    "session_id": "session_001",
    "total_requests": 150,
    "total_tokens": 3000,
    "avg_latency": 200,
    "role_tag": "admin",
    "ressource_tag": "resource_001",
    "id_s3_aws": "s3_001"
  },
  {
    "stats_id": 2,
    "session_id": "session_002",
    "total_requests": 120,
    "total_tokens": 2500,
    "avg_latency": 180,
    "role_tag": "user",
    "ressource_tag": "resource_002",
    "id_s3_aws": "s3_002"
  },
  {
    "stats_id": 3,
    "session_id": "session_003",
    "total_requests": 200,
    "total_tokens": 4000,
    "avg_latency": 220,
    "role_tag": "guest",
    "ressource_tag": "resource_003",
    "id_s3_aws": "s3_003"
  },
  {
    "stats_id": 4,
    "session_id": "session_004",
    "total_requests": 180,
    "total_tokens": 3500,
    "avg_latency": 210,
    "role_tag": "admin",
    "ressource_tag": "resource_004",
    "id_s3_aws": "s3_004"
  },
  {
    "stats_id": 5,
    "session_id": "session_005",
    "total_requests": 160,
    "total_tokens": 3200,
    "avg_latency": 190,
    "role_tag": "user",
    "ressource_tag": "resource_005",
    "id_s3_aws": "s3_005"
  }
];
  
  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/stats');
      console.log("Fetching the stats");
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };
  
  onMounted(() => {
    fetchStats();
  });
  </script>
  
  <style scoped>
  .stats-board {
    padding: 20px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 10px;
    border: 1px solid #ddd;
    text-align: left;
  }
  
  th {
    background-color: #f4f4f4;
  }
  </style>