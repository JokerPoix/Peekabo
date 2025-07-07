<template>
  <div class="page-container">
    <div class="form-container">
      <form class="menu" @submit.prevent="handleSignup">
        <div class="input-group">
          <label for="username">Nom d'utilisateur</label>
          <input type="text" id="username" v-model="username" required />
        </div>
        <div class="input-group">
          <label for="password">Mot de passe</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <div class="input-group">
          <label for="confirmPassword">Confirmez le mot de passe</label>
          <input type="password" id="confirmPassword" v-model="confirmPassword" required />
        </div>
        <button type="submit" class="signup-button">S'inscrire</button>
        <p class="login-link">
          Vous avez déjà un compte ? <router-link to="/login">Se connecter</router-link>
        </p>
      </form>
    </div>
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
  display: flex;
  justify-content: center;
  align-items: center;
}

.form-container {
  width: 100%;
  max-width: 500px;
  display: flex;
  justify-content: center;
}

form {
  width: 100%;
}

.input-group {
  margin-bottom: 1rem;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
}
</style>