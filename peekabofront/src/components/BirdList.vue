<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Bird } from '@/api/peekaboo_methods.schemas';
import { getBirds } from '@/api/default';

const birds = ref<(Bird & { image: string })[]>([]);
const selectedBirdId = ref<number | null>(null);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);

// Define the emit for component usage
const emit = defineEmits(['bird-selected']);

const fetchBirds = async () => {
  loading.value = true;
  error.value = null;
  try {
    // Call the API using the generated client
    const response = await getBirds();
    console.log('API response:', response); // Debug log
    
    if (response.data && Array.isArray(response.data)) {
      // Map the response to include image URLs
      birds.value = response.data.map(bird => ({
        ...bird,
        image: getRandomBirdImage(bird.name || ''),
      }));
    } else {
      console.error('Unexpected API response format:', response);
      error.value = 'Unexpected response format from API';
    }
  } catch (err) {
    console.error('Error fetching birds:', err);
    error.value = 'Failed to load birds. Please try again later.';
  } finally {
    loading.value = false;
  }
};

// Helper function to assign random bird images
const getRandomBirdImage = (birdName: string) => {
  const images = [
    'https://upload.wikimedia.org/wikipedia/commons/e/e1/Hausrotschwanz_Brutpflege_2006-05-24_211.jpg?uselang=fr',
    'https://upload.wikimedia.org/wikipedia/commons/b/bd/PasserDomesticusKopula.jpg?uselang=fr',
  ];
  
  const index = birdName.charCodeAt(0) % images.length;
  return images[index];
};

const toggleSelection = (birdId: number) => {
  // Find the bird object
  const selectedBird = birds.value.find(b => b.id === birdId);
  
  if (selectedBirdId.value === birdId) {
    // Deselect bird
    selectedBirdId.value = null;
    emit('bird-selected', null);
  } else {
    // Select bird
    selectedBirdId.value = birdId;
    if (selectedBird) {
      emit('bird-selected', selectedBird);
    }
  }
};

onMounted(() => {
  fetchBirds();
});
</script>

<template>
  <div>
    
    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <div>Chargement des oiseaux...</div>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="error-message">
      {{ error }}
      <div>
        <button @click="fetchBirds" class="retry-button">Réessayer</button>
      </div>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="birds.length === 0" class="empty-state">
      Aucun oiseau trouvé. L'API retourne peut-être un tableau vide.
      <div>
        <button @click="fetchBirds" class="retry-button">Réessayer</button>
      </div>
    </div>
    
    <!-- Birds list -->
    <div v-else class="bird-list-container">
      <div 
        v-for="bird in birds" 
        :key="bird.id" 
        class="bird-card"
        :class="{ 'selected': selectedBirdId === bird.id }"
        @click="toggleSelection(bird.id)"
      >
        <div class="bird-info">
          <div class="bird-image">
            <img :src="bird.image" alt="Photo de l'oiseau" />
          </div>
          <div class="bird-details">
            <div class="bird-name">{{ bird.name }}</div>
            <div class="bird-location" v-if="bird.latitude && bird.longitude">
              <span>{{ bird.latitude.toFixed(6) }}, {{ bird.longitude.toFixed(6) }}</span>
            </div>
            <div class="bird-owner" v-if="bird.owner">Propriétaire : {{ bird.owner }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bird-list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.bird-card {
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.bird-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.bird-card.selected {
  background-color: #e0f7fa;
  border-color: #00bcd4;
}

.bird-info {
  display: flex;
  align-items: center;
}

.bird-image {
  margin-right: 20px;
}

.bird-image img {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
}

.bird-details {
  flex: 1;
}

.bird-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.bird-location {
  color: #666;
  margin-bottom: 5px;
}

.bird-owner {
  font-style: italic;
  color: #555;
}

.loading-state, .error-message, .empty-state {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error-message {
  color: #d32f2f;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3498db;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 10px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.retry-button {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.retry-button:hover {
  background-color: #2980b9;
}
</style>