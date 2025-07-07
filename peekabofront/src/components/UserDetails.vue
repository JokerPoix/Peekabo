<template>
  <div v-if="user" class="user-details-card">
    <h1>Détails de l'utilisateur</h1>
    <div class="details-container">
      <div class="detail-item">
        <div class="detail-label">Email&nbsp;:</div>
        <div class="detail-value">{{ user.email }}</div>
      </div>
      <!-- Ajoutez d'autres détails utilisateur ici si nécessaire -->
    </div>
  </div>
  <div v-else class="user-details-card loading">
    <div class="loading-indicator">
      <span>Chargement des détails de l'utilisateur...</span>
    </div>
  </div>
</template>
  
<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import type { User } from '@/api/peekaboo_methods.schemas';

export default defineComponent({
  name: 'UserDetails',
  props: {
    userId: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const user = ref<User | null>(null);

    onMounted(async () => {
      const response = await fetch(`/api/users/${props.userId}`);
      user.value = await response.json();
    });

    return { user };
  },
});
</script>

<style scoped>
.user-details-card {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

.user-details-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  font-weight: 600;
  position: relative;
  padding-bottom: 0.8rem;
}

h1::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  height: 3px;
  width: 60px;
  background: var(--primary-color, #ffd000);
  border-radius: 3px;
}

.details-container {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.detail-item {
  display: flex;
  padding: 0.8rem 1.2rem;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  transition: all 0.2s ease;
}

.detail-item:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
}

.detail-label {
  font-weight: 600;
  min-width: 100px;
}

.detail-value {
  flex: 1;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-style: italic;
  opacity: 0.8;
}

.loading-indicator::before {
  content: '';
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid var(--primary-color, #ffd000);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>