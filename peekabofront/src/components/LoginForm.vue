<template>
  <div class="login-form">
    <h1>Login</h1>
    <form @submit.prevent="handleLogin">
      <div class="input-group">
        <label for="username">Username</label>
        <div class="modern-input-container">
          <input type="text" id="username" v-model="username" required placeholder="Enter your username" class="modern-input" />
        </div>
      </div>
      <div class="input-group">
        <label for="password">Password</label>
        <div class="modern-input-container">
          <input type="password" id="password" v-model="password" required placeholder="Enter your password" class="modern-input" />
        </div>
      </div>
      <button type="submit" class="modern-button">
        <span class="btn-text">Connexion</span>
      </button>
      <p class="signup-link">
        Vous n'avez pas de compte ? <router-link to="/signup" class="modern-link">S'inscrire</router-link>
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
    };
  },
  methods: {
    handleLogin() {
      console.log('Logging in with:', this.username, this.password);
      // Add authentication logic here
    },
  },
};
</script>

<style scoped>
.login-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  font-weight: 600;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.95rem;
}

.modern-input-container {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.modern-input-container:focus-within {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.modern-input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: none;
  background-color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

.modern-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.8rem 1.2rem;
  margin-top: 1.5rem;
  border-radius: 12px;
  border: none;
  background-color: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.25s ease;
  color: var(--text-color, white);
  font-weight: 600;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.modern-button::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(100%);
  transition: transform 0.25s ease;
  z-index: 1;
}

.modern-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 14px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.1);
}

.modern-button:hover::after {
  transform: translateY(0);
}

.modern-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-text {
  position: relative;
  z-index: 2;
  font-size: 1rem;
}

.signup-link {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
}

.modern-link {
  color: var(--primary-color, #ffd000);
  text-decoration: none;
  font-weight: 600;
  position: relative;
  display: inline-block;
  padding: 0 2px;
  transition: all 0.3s ease;
}

.modern-link::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  bottom: 0;
  left: 0;
  background-color: var(--primary-color, #ffd000);
  transform: scaleX(0);
  transform-origin: bottom right;
  transition: transform 0.3s ease;
}

.modern-link:hover::after {
  transform: scaleX(1);
  transform-origin: bottom left;
}
</style>