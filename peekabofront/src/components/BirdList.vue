<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import type { Bird } from '@/api/peekaboo_methods.schemas';

export default defineComponent({
  name: 'BirdList',
  setup() {
    const birds = ref<(Bird & { image: string })[]>([]);
    const selectedBirdId = ref<number | null>(null);

    onMounted(() => {
      // Mock bird list with profile images
      birds.value = [
        {
          id: 1,
          name: 'Eagle',
          latitude: 48.8566, // Example: Paris
          longitude: 2.3522,
          owner: 'John Doe',
          gps_id: 'GPS123',
          image: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Hausrotschwanz_Brutpflege_2006-05-24_211.jpg?uselang=fr',
        },
        {
          id: 2,
          name: 'Sparrow',
          latitude: 51.5074, // Example: London
          longitude: -0.1278,
          owner: 'Jane Smith',
          gps_id: 'GPS456',
          image: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/PasserDomesticusKopula.jpg?uselang=fr',
        },
      ];
    });

    const toggleSelection = (birdId: number) => {
      if (selectedBirdId.value === birdId) {
        selectedBirdId.value = null;
      } else {
        selectedBirdId.value = birdId;
      }
    };

    return { birds, selectedBirdId, toggleSelection };
  },
});
</script>

<template>
  <div>
    <h1>Bird List</h1>
    <div class="bird-list-container">
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
</style>