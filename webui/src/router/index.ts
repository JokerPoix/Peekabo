import { createRouter, createWebHistory } from 'vue-router'
import homePage from "../pages/HomePage.vue";
import adminchatbot from "../pages/AdminChatbotPage.vue";
import documents_uploader from "../pages/DocumentPage.vue";
import ApplicationSelectionPage from '../pages/ApplicationSelectionPage.vue';
import StatsBoardPage from '@/pages/StatsBoardPage.vue';
import PromptPage from '@/pages/PromptPage.vue';
import SSEChatbot from '@/pages/SSEChatbotPage.vue';
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "",
      component: ApplicationSelectionPage
    },
    {
      path: '/menu',
      name: 'home',
      component: homePage
    },
    { path: '/stats', 
      name:'stats',
      component: StatsBoardPage
    },
    { path: '/adminchatbot', 
      name:'adminchatbot',
      component: adminchatbot
    },
    {
      path: '/documents',
      name: 'Documents Uplaoder',
      component: documents_uploader
    },
    {
      path: '/ssechatbot',
      name: 'SSE Chatbot',
      component: SSEChatbot
    },
    {
      path: '/promptpage',
      name: 'Prompt Page',
      component: PromptPage
    },
  ]
})


export default router
