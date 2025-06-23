<template>
  <div class="page-container">
    <form class="menu" @submit.prevent="handleSignup">
      <div class="input-group">
        <label for="username">Username</label>
        <input type="text" id="username" v-model="username" required />
      </div>
      <div class="input-group">
        <label for="password">Password</label>
        <input type="password" id="password" v-model="password" required />
      </div>
      <div class="input-group">
        <label for="confirmPassword">Confirm Password</label>
        <input type="password" id="confirmPassword" v-model="confirmPassword" required />
      </div>
      <button type="submit" class="signup-button">Sign Up</button>
      <p class="login-link">
        Already have an account? <router-link to="/login">Log in</router-link>
      </p>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      confirmPassword: '',
    };
  },
  methods: {
    handleSignup() {
      if (this.password !== this.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      // Handle signup logic here
      console.log('Signing up with:', this.username, this.password);
      // You can add your registration logic here
    },
  },
};
</script>

<style scoped>
.page-container {
  background-image: url('@/assets/img/pexels-couleur-2317904.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
  color: white;
  text-shadow: 0 0 5px #000; /* for better readability */
  align-items: center;
  display: flex;
}
</style>