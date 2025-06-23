<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { useRouter } from "vue-router";

const router = useRouter();


const accessBirdListPage = () => {
  router.push("/birdlist");
};

const accessBirdLocationPage = () => {
  router.push("/birdlocation");
};

const accessLoginPage = () => {
  router.push("/login");
};


const accessGenLoginPage = () => {
  router.push("/sign_up");
};

const accessGenLogin = () => {
  router.push("/gen_login");
};


const accessHomePage = () => {
  router.push("/");
};
</script>

<template>
  <header>
    <nav class="navbar">
      <div class="nav-container">
        <img src="./assets/img/image_peekaboo.png" alt="Peekaboo Icon" class="chatbot-icon" width="auto" />
        <div class="nav-buttons">
          <button type="button" @click="accessHomePage">🏠 Home</button>
          <button type="button" @click="accessBirdListPage">🦜 Liste des Oiseaux</button>
          <button type="button" @click="accessBirdLocationPage">📍 Localisation d'un Oiseau</button>
          <button type="button" @click="accessGenLogin"> Gen Login</button>
          <button type="button" @click="accessGenLoginPage"> Gen Login Page</button>
        </div>
      </div>
    </nav>
  </header>
  <main>
    <RouterView />
  </main>
  <footer>
    <p>&copy; 2025 Peekaboo. All rights reserved.</p>
  </footer>
</template>

<style scoped>



.chatbot-icon {
  width: "auto";
  height: 70px;
  border-radius: 50%;
  align-items: center;
  display: flex;
}

.nav-link {
  color: var(--text-color);
  text-decoration: none;
  font-weight: bold;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  align-items: center;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>