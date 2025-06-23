<template>
    <div v-if="user">
      <h1>User Details</h1>
      <p><strong>Email:</strong> {{ user.email }}</p>
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