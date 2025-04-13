<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';


// Depth level input
const depthLevel = ref(3); // Default depth level
const prompts = ref([]); // Data fetched from the API

// Function to fetch prompts based on depth level
const fetchPrompts = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/admin/prompts?depthLevel=${depthLevel.value}`);
    prompts.value = response.data;
  } catch (error) {
    console.error('Error fetching prompts:', error);
    alert('Failed to fetch prompts.');
  }
};
</script>

<template>
  <div class="prompt-page">
    <h1>Prompt Management</h1>

    <!-- Input for Depth Level -->
    <section class="depth-section">
      <h2>Fetch Prompts</h2>
      <div class="form-group">
        <label for="depth-level">Depth Level:</label>
        <input v-model="depthLevel" type="number" id="depth-level" min="1" placeholder="Enter Depth Level" />
        <button @click="fetchPrompts">Fetch Prompts</button>
      </div>
    </section>

    <!-- Display Fetched Prompts -->
    <section class="result-section" v-if="prompts.length > 0">
      <h2>Fetched Prompts</h2>
      <pre>{{ prompts }}</pre>
    </section>
  </div>
</template>

<style scoped>
.prompt-page {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.depth-section {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

button {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.result-section {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  background-color: #f9f9f9;
  white-space: pre-wrap;
}
</style>