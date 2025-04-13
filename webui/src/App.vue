<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <header>
    <div class="header-content">
      <img src="../image_chatbot.png" alt="Chatbot Icon" class="chatbot-icon" />
      <h1 class="exatitle">Exa'Doc</h1>
    </div>
    <nav>
      <RouterLink to="/">Home</RouterLink>
    </nav>
  </header>
  
  <main>
    <RouterView />
  </main>

  <footer>
    <p>&copy; 2025 Exa'Doc. All rights reserved.</p>
  </footer>
</template>

