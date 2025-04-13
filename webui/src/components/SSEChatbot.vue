<script setup lang="ts">
import { ref, nextTick } from "vue";
import MarkdownIt from "markdown-it";
import { useI18n } from "vue-i18n";

const userMessage = ref("");
const messages = ref<{ sender: string; text: string; timestamp?: string }[]>([]);
const showDropdown = ref(false);
const chatContainer = ref<HTMLElement | null>(null);
const md = new MarkdownIt();
const { t } = useI18n();

const deleteHistory = async () => {
  console.log("Delete history placeholder - Implement API call here");
  showDropdown.value = false;
};

const renderMarkdown = (text: string) => {
  return md.render(text);
};

const loading = ref(false);

/**
 * Sends the user message via a POST request to the SSE endpoint,
 * then reads the streaming response using a ReadableStream.
 */
const sendMessage = () => {
  if (!userMessage.value.trim()) return;

  // Push user message into our messages list
  messages.value.push({ sender: "user", text: userMessage.value });
  loading.value = true;

  // POST to the SSE endpoint
  fetch("http://localhost:8084/api/rag/stream", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain"
    },
    body: userMessage.value
  })
    .then((response) => {
      if (!response.body) {
        throw new Error("ReadableStream not supported in this browser.");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let partial = "";

      function read() {
        reader
          .read()
          .then(({ done, value }) => {
            if (done) {
              loading.value = false;
              return;
            }
            partial += decoder.decode(value, { stream: true });
            // SSE events are separated by double newlines
            const parts = partial.split("\n\n");
            // The last element might be incomplete—store it back in partial.
            partial = parts.pop() || "";
            parts.forEach((eventStr) => {
              const lines = eventStr.split("\n").filter((line) => line.trim() !== "");
              let eventType = "";
              let dataStr = "";
              lines.forEach((line) => {
                if (line.startsWith("event:")) {
                  eventType = line.replace("event:", "").trim();
                } else if (line.startsWith("data:")) {
                  dataStr += line.replace("data:", "").trim();
                }
              });
              if (eventType === "message") {
                try {
                  const messageObj = JSON.parse(dataStr);
                  if (messageObj.sender === "bot") {
                    // For streaming responses, append to the last bot message
                    if (messageObj.stream) {
                      if (
                        messages.value.length > 0 &&
                        messages.value[messages.value.length - 1].sender === "bot"
                      ) {
                        messages.value[messages.value.length - 1].text += messageObj.message;
                      } else {
                        messages.value.push({ sender: messageObj.sender, text: messageObj.message });
                      }
                    } else {
                      messages.value.push({ sender: messageObj.sender, text: messageObj.message });
                    }
                  } else {
                    messages.value.push({ sender: messageObj.sender, text: messageObj.message });
                  }
                  nextTick(() => {
                    if (chatContainer.value) {
                      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
                    }
                  });
                } catch (err) {
                  console.error("Error parsing SSE message:", err);
                }
              }
            });
            // Continue reading the stream
            read();
          })
          .catch((err) => {
            console.error("Error reading stream:", err);
            loading.value = false;
          });
      }
      read();
    })
    .catch((err) => {
      console.error("Error fetching SSE stream:", err);
      loading.value = false;
    });

  userMessage.value = "";
};
</script>

<template>
  <div id="markdown-content" class="chat-container">
    <div class="chat-box" ref="chatContainer">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="message-wrapper"
        :class="msg.sender"
      >
        <div class="sender-label-box" v-if="msg.sender === 'bot'">
          <img src="@/../image_chatbot.png" alt="Chatbot Icon" class="bot-icons" />
          <div class="sender-label">Chatbot</div>
        </div>
        <div class="message-box">
          <div :class="['message', msg.sender]" v-html="renderMarkdown(msg.text)"></div>
        </div>
      </div>
      <!-- Show loading animation when chatbot is processing -->
      <div v-if="loading" class="message-wrapper bot">
        <div class="sender-label-box">
          <img src="@/../image_chatbot.png" alt="Chatbot Icon" class="bot-icons" />
          <div class="sender-label">Chatbot</div>
        </div>
        <div class="message-box">
          <img src="@/../typing-texting.gif" alt="Typing..." class="loading-animation" />
        </div>
      </div>
    </div>
    <div class="chat-input-container">
      <input
        v-model="userMessage"
        @keyup.enter="sendMessage"
        :placeholder="$t('chatbot.placeholder')"
      />
      <button class="send-button" @click="sendMessage">{{ $t("chatbot.send") }}</button>
      <button class="menu-button" @click="showDropdown = !showDropdown">⋮</button>
      <div v-if="showDropdown" class="dropdown-menu">
        <button @click="deleteHistory">{{ $t("chatbot.delete_history") }}</button>
        <button @click="showDropdown = false">{{ $t("chatbot.options") }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  min-height: 100px;
  max-height: 400px;
  height: auto;
  border: 2px solid #007fff;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.chat-box {
  min-height: 100px;
  max-height: 400px;
  height: auto;
  overflow-y: auto;
  padding-bottom: 10px;
  margin-bottom: 10px;
  background: #f0f8ff;
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 10px;
  width: 100%;
}

.sender-label-box {
  align-self: flex-start;
  padding: 5px 10px;
  border-radius: 8px;
  background: rgba(0, 127, 255, 0.1);
  display: flex;
  align-items: center;
  margin-bottom: 3px;
}

.bot-icons {
  font-size: 14px;
  margin-right: 5px;
  width: 40px;
  border-radius: 8px;
}

.sender-label {
  font-size: 12px;
  font-weight: bold;
  color: #007fff;
  opacity: 0.8;
}

.message-box {
  align-self: flex-start;
  padding: 8px 12px;
  border-radius: 10px;
  background: #e0e0e0;
  max-width: 75%;
}

.message {
  word-break: break-word;
  font-size: 14px;
}

.user .message-box {
  align-self: flex-end;
  background: #007fff;
  color: white;
}

.chat-input-container {
  display: flex;
  align-items: center;
  gap: 5px;
  padding-top: 10px;
  border-top: 1px solid #007fff;
  margin: 10px;
}

.chat-input-container input {
  flex-grow: 1;
  padding: 10px;
  border: 2px solid #007fff;
  border-radius: 5px;
  outline: none;
}

.send-button,
.menu-button {
  background: #007fff;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.send-button:hover,
.menu-button:hover {
  background: #005bbf;
}

.dropdown-menu {
  position: absolute;
  bottom: 50px;
  right: 10px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.dropdown-menu button {
  background: none;
  border: none;
  padding: 10px;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.dropdown-menu button:hover {
  background: #f0f0f0;
}

.loading-animation {
  width: 50px;
  display: block;
  margin: auto;
}
</style>
