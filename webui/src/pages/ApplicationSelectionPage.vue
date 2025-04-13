<template>
    <div class="application-selection">
      <h1 class="blue_title">Select an application</h1>
      <button type="button" @click="selectapplication('application1')">Proovme</button>
      <button type="button" @click="selectapplication('application2')">Viatique</button>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useRouter } from "vue-router";
  const router = useRouter();
  
  const selectapplication = (application: string) => {
    // Store the selected application in local storage or a global state
    localStorage.setItem('selectedapplication', application);
    // Navigate to the HomePage
    router.push("/menu");
  };
  </script>
  
  <style scoped>
  .application-selection {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  button {
    margin: 10px;
    padding: 10px 20px;
    font-size: 16px;
    background: white;
    border: 1px solid #ccc;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  }

  .blue_title {
    color: var(--secondary-color);
    background-color: var(--primary-color);
    padding: 10px;
    border-radius: 8px;
    border: 1px solid transparent;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  }
  </style>