<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import type { Bird } from '@/api/peekaboo_methods.schemas';

export default defineComponent({
  name: 'BirdDetails',
  props: {
    birdId: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const bird = ref<Bird | null>(null);

    onMounted(async () => {
      const response = await fetch(`/api/birds/${props.birdId}`);
      bird.value = await response.json();
    });

    return { bird };
  },
});
</script>


<template>
  <div v-if="bird">
    <h1>Détails de l'oiseau</h1>
    <p><strong>Nom :</strong> {{ bird.name }}</p>
    <p><strong>Latitude :</strong> {{ bird.latitude }}</p>
    <p><strong>Longitude :</strong> {{ bird.longitude }}</p>
    <p><strong>Propriétaire :</strong> {{ bird.owner }}</p>
    <p><strong>ID GPS :</strong> {{ bird.gps_id }}</p>
  </div>
</template>
  
