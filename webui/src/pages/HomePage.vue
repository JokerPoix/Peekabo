<template>
  <div class="menu">
    <button type="button" @click="accessChatbot">💬 Tester l'Aide</button>
    <button type="button"  @click="accessDocumentPage">📑 Gestion des Aides</button>
    <button type="button"  @click="accessStats">📊 Statistiques</button>
    <button type="button"  @click="accessSseChabot ">📊 SSEChatbot</button>
    <button type="button"  @click="accessPromptPage ">Gestion des Prompts</button>
  </div>

</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
const accessChatbot = () => {
  router.push("/adminchatbot");
};
const accessDocumentPage = () => {
  router.push("/documents");
};
const accessStats = () => {
  router.push("/stats");
};
const accessSseChabot = () => {
  router.push("/ssechatbot");
};
const accessPromptPage = () => {
  router.push("/promptpage");
};
</script>


