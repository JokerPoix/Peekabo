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
          <button type="button" class="modern-btn" @click="accessHomePage">
            <span class="btn-icon">🏠</span>
            <span class="btn-text">Acceuil</span>
          </button>
          <button type="button" class="modern-btn" @click="accessBirdListPage">
            <span class="btn-icon">🦜</span>
            <span class="btn-text">Liste des Oiseaux</span>
          </button>
          <button type="button" class="modern-btn" @click="accessBirdLocationPage">
            <span class="btn-icon">📍</span>
            <span class="btn-text">Localisation d'un Oiseau</span>
          </button>
          <button type="button" class="modern-btn" @click="accessGenLogin">
            <span class="btn-icon">👤</span>
            <span class="btn-text">Gen Login</span>
          </button>
          <button type="button" class="modern-btn" @click="accessGenLoginPage">
            <span class="btn-icon">📝</span>
            <span class="btn-text">Gen Login Page</span>
          </button>
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

.nav-container {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.modern-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  padding: 0.6rem 1.2rem;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.15);
  border: none;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.25s ease;
  max-width: none;
  width: auto;
  color: var(--text-color);
  position: relative;
  overflow: hidden;
}

.modern-btn::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(100%);
  transition: transform 0.25s ease;
  z-index: 1;
}

.modern-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 14px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.1);
}

.modern-btn:hover::after {
  transform: translateY(0);
}

.modern-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-icon {
  font-size: 1.2rem;
  position: relative;
  z-index: 2;
}

.btn-text {
  font-size: 0.95rem;
  position: relative;
  z-index: 2;
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    padding: 1rem;
  }
  
  .nav-buttons {
    margin-top: 1rem;
    justify-content: center;
  }
  
  .modern-btn {
    padding: 0.4rem 0.8rem;
  }
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