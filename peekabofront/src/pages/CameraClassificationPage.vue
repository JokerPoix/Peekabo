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
      <div v-if="loadingDescription" class="description-loading">
        Chargement de la description...
      </div>
      <div v-if="description" class="description">
        <h4>Description :</h4>
        <p>{{ description }}</p>
      </div>
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
      description: null,
      loadingDescription: false,
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
        
        // Fetch bird description from LLM
        if (this.topPrediction) {
          this.fetchBirdDescription(this.topPrediction.species);
        }
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    async fetchBirdDescription(speciesName) {
      this.description = null;
      this.loadingDescription = true;
      try {
        const response = await fetch('/llm/get-chat-birds/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Give me a short description (2-3 sentences) about the ${speciesName} bird species, including habitat and key characteristics.`,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Stream the response text
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
        }

        this.description = fullText;
      } catch (err) {
        this.description = `Unable to load description: ${err.message}`;
      } finally {
        this.loadingDescription = false;
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
.description-loading {
  margin-top: 16px;
  font-style: italic;
  color: #999;
}
.description {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
  text-align: left;
}
.description h4 {
  margin: 0 0 8px 0;
  color: #1976d2;
}
.description p {
  margin: 8px 0;
  line-height: 1.6;
  color: #333;
}
</style>