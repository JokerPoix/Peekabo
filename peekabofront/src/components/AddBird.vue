<template>
  <div>
    <h1>Add Bird</h1>
    <form @submit.prevent="addBird">
      <label>
        Name:
        <input v-model="bird.name" type="text" required />
      </label>
      <label>
        Latitude:
        <input v-model="bird.latitude" type="number" required />
      </label>
      <label>
        Longitude:
        <input v-model="bird.longitude" type="number" required />
      </label>
      <label>
        Owner:
        <input v-model="bird.owner" type="text" required />
      </label>
      <button type="submit">Add Bird</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import type { Bird } from '@/api/peekaboo_methods.schemas';

export default defineComponent({
  name: 'AddBird',
  setup() {
    const bird = reactive<Bird>({
      name: '',
      latitude: 0,
      longitude: 0,
      owner: '',
    });

    const addBird = async () => {
      await fetch('/api/birds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bird),
      });
      alert('Bird added successfully!');
    };

    return { bird, addBird };
  },
});
</script>