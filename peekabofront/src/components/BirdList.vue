<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import type { Bird } from '@/api/peekaboo_methods.schemas';
import { getBirds } from '@/api/default';

export default defineComponent({
  name: 'BirdList',
  emits: ['bird-selected'], // Define the emit
  setup(props, { emit }) {
    const birds = ref<(Bird & { image: string })[]>([]);
    const selectedBirdId = ref<number | null>(null);
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);

    const fetchBirds = async () => {
      loading.value = true;
      error.value = null;
      try {
        // Call the API using the generated client
        const response = await getBirds();
        
        // Map the response to include image URLs
        birds.value = response.data.map(bird => ({
          ...bird,
          image: getRandomBirdImage(bird.name || ''),
        }));
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

    onMounted(() => {
      fetchBirds();
    });

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

    return { birds, selectedBirdId, toggleSelection, loading, error };
  },
});
</script>

<template>
  <div>
    <h1>Bird List</h1>
    
    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      Loading birds...
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>
    
    <!-- Empty state -->
    <div v-else-if="birds.length === 0" class="empty-state">
      No birds found.
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
            <img :src="bird.image" alt="Bird Profile" />
          </div>
          <div class="bird-details">
            <div class="bird-name">{{ bird.name }}</div>
            <div class="bird-location">
              <span>{{ bird.latitude }}, {{ bird.longitude }}</span>
            </div>
            <div class="bird-owner">Owner: {{ bird.owner }}</div>
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
</style>