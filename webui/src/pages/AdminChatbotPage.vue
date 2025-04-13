<script setup lang="ts">
import Chatbot from "@/components/AdminChatbot.vue";
</script>

<template>
  <body>
    <main>
      <div class="card">
        <h1 class="blue-title"> 👷💻 Admin Chatbot</h1>
        <div class="admin-chatbot-container">
          <Chatbot />
        </div>
      </div>
    </main>
  </body>

</template>

<style scoped>
  .admin-chatbot-container {
    position: fixed;
    display: contents;
    min-height: 100vh;
    height: 300px;
    bottom: 20px;
    right: 20px;
    width: 350px;
    background: white;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    overflow-y: auto;
  }

  .body {
    min-height: 100px;
    max-height: 400px;  
    height: auto; 
  }
</style>
