<template>
  <body>
    <div class="page-container">
      <div class="form-container">
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

.login-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-link {
  margin-bottom: 1rem;
}
</style>