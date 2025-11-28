<template>
  <div>
    <input type="file" accept="image/*" @change="onFileChange" />
    <input type="number" v-model.number="topK" min="1" max="10" placeholder="Top K (default 3)" />
    <button @click="sendToApi" :disabled="!imageBase64 || loading">Envoyer</button>
    <div v-if="loading">Analyse en cours...</div>
    <div v-if="topPrediction" class="prediction-result">
      <h3>Espèce prédite :</h3>
      <p class="species-name">{{ topPrediction.species }}</p>
      <p class="confidence">Confiance : {{ (topPrediction.confidence * 100).toFixed(2) }}%</p>
    </div>
    <div v-if="error" style="color: red">{{ error }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      imageBase64: null,
      topK: 3,
      loading: false,
      result: null,
      error: null,
      topPrediction: null,
    };
  },
  methods: {
    onFileChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        this.imageBase64 = reader.result;
      };
      reader.readAsDataURL(file);
    },
    async sendToApi() {
      if (!this.imageBase64) return;
      this.loading = true;
      this.result = null;
      this.error = null;
      this.topPrediction = null;
      try {
        // Convert base64 to Blob
        const base64 = this.imageBase64.split(',')[1];
        const byteCharacters = atob(base64);
        const byteNumbers = Array.from(byteCharacters, c => c.charCodeAt(0));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });

        const formData = new FormData();
        formData.append('image', blob, 'image.jpg');
        formData.append('top_k', this.topK);

        const response = await fetch('/predict', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Unknown error');
        }
        this.result = data;
        this.topPrediction = data.top_prediction || null;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.prediction-result {
  margin-top: 24px;
  padding: 16px;
  background: #f6f8fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  text-align: center;
}
.species-name {
  font-size: 2rem;
  font-weight: bold;
  color: #1976d2;
  margin: 8px 0;
}
.confidence {
  font-size: 1.1rem;
  color: #555;
}
</style>