<template>
  <div>
    <video ref="video" autoplay playsinline></video>
    <canvas ref="canvas" style="display:none"></canvas>
    <button @click="capture">Capturer</button>
    <div v-if="error" style="color: red">{{ error }}</div>
  </div>
</template>

<script>
export default {
  emits: ['captured'],
  data() {
    return {
      error: null,
    };
  },
  mounted() {
    this.startCamera();
  },
  methods: {
    async startCamera() {
      try {
        // Prefer rear camera on mobile devices
        const constraints = {
          video: {
            facingMode: { ideal: 'environment' }
          }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.$refs.video.srcObject = stream;
      } catch (err) {
        this.error = "Impossible d'accéder à la caméra : " + err.message;
      }
    },
    capture() {
      const video = this.$refs.video;
      const canvas = this.$refs.canvas;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg');
      this.$emit('captured', base64);
    }
  }
};
</script>