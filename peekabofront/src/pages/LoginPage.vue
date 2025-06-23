<template>
  <body>
    <div class="page-container">
        <form @submit.prevent="handleLogin">
          <div class="input-group">
            <label for="username">Identifiant</label>
            <input type="text" id="username" v-model="username" placeholder="Entrez votre identifiant" required />
          </div>
          <div class="input-group">
            <label for="password">Mot de passe</label>
            <input type="password" id="password" v-model="password" placeholder="Entrez votre mot de passe" required />
          </div>
          <div class="login-actions">
            <router-link to="/signup" class="login-link">Pas encore inscrit ? Inscription</router-link>
            <button type="submit" class="signup-button">Connexion</button>
          </div>
        </form>
    </div>
  </body>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
    };
  },
  methods: {
    handleLogin() {
      console.log('Logging in with:', this.username, this.password);
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