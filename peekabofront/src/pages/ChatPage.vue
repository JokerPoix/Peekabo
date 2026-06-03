<template>
  <div class="chat-container">
    <div class="chat-header">
      <h1>Chat with LLM</h1>
      <button class="clear-btn" @click="clearChat">Clear Chat</button>
    </div>
    
    <div class="chat-messages" ref="messagesContainer">
      <div v-for="(message, index) in messages" :key="index" :class="['message', message.role]">
        <div class="message-content">{{ message.content }}</div>
      </div>
      <div v-if="loading" class="message assistant">
        <div class="message-content loading-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>

    <div class="chat-input-area">
      <textarea
        v-model="inputMessage"
        @keydown.enter.ctrl="sendMessage"
        @keydown.enter.shift="addNewLine"
        placeholder="Type your message here... (Ctrl+Enter to send)"
        :disabled="loading"
        class="input-field"
      ></textarea>
      <button 
        @click="sendMessage" 
        :disabled="!inputMessage.trim() || loading"
        class="send-btn"
      >
        {{ loading ? 'Sending...' : 'Send' }}
      </button>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script>
export default {
  name: 'ChatPage',
  data() {
    return {
      messages: [],
      inputMessage: '',
      loading: false,
      error: null,
    };
  },
  methods: {
    async sendMessage() {
      if (!this.inputMessage.trim()) return;

      const userMessage = this.inputMessage.trim();
      this.inputMessage = '';
      this.error = null;

      // Add user message to chat
      this.messages.push({
        role: 'user',
        content: userMessage,
      });

      this.loading = true;
      this.scrollToBottom();

      try {
        const response = await fetch('/llm/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Stream the response text via SSE
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = '';
        let buffer = '';

        // Add empty assistant message to update in real-time
        this.messages.push({
          role: 'assistant',
          content: '',
        });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n');
          // Keep the last incomplete part in the buffer
          buffer = parts.pop() || '';

          for (const part of parts) {
            if (part.startsWith('data: ')) {
              const data = part.slice(6);
              if (data === '[DONE]') break;
              if (data.startsWith('[ERROR]')) {
                assistantContent += data;
              } else {
                assistantContent += data;
              }
            }
          }

          // Update the last message in real-time
          if (this.messages.length > 0) {
            this.messages[this.messages.length - 1].content = assistantContent;
            this.scrollToBottom();
          }
        }
      } catch (err) {
        this.error = err.message;
        // Add error message to chat
        this.messages.push({
          role: 'assistant',
          content: `Error: ${err.message}`,
        });
      } finally {
        this.loading = false;
        this.scrollToBottom();
      }
    },
    clearChat() {
      this.messages = [];
      this.inputMessage = '';
      this.error = null;
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },
    addNewLine() {
      // Allow Shift+Enter to add new line
      // Vue will handle this automatically
    },
  },
  mounted() {
    // Focus input on mount
    this.$nextTick(() => {
      const input = this.$el.querySelector('.input-field');
      if (input) input.focus();
    });
  },
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 900px;
  margin: 0 auto;
  padding: 16px;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.chat-header h1 {
  margin: 0;
  font-size: 24px;
  color: #1976d2;
}

.clear-btn {
  padding: 8px 16px;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.clear-btn:hover {
  background: #ff5252;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  animation: fadeIn 0.3s ease-in;
}

.message.user {
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 8px;
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 1.5;
}

.message.user .message-content {
  background: #1976d2;
  color: white;
}

.message.assistant .message-content {
  background: white;
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.message-content.loading-dots {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
}

.message-content.loading-dots span {
  width: 8px;
  height: 8px;
  background: #999;
  border-radius: 50%;
  animation: bounce 1.4s infinite;
}

.message-content.loading-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.message-content.loading-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  40% {
    opacity: 1;
    transform: translateY(-10px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-input-area {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.input-field {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  min-height: 60px;
  max-height: 150px;
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.input-field:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.send-btn {
  padding: 12px 24px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
  align-self: flex-end;
}

.send-btn:hover:not(:disabled) {
  background: #1565c0;
}

.send-btn:disabled {
  background: #bdbdbd;
  cursor: not-allowed;
}

.error-message {
  padding: 12px 16px;
  background: #ffebee;
  color: #c62828;
  border-radius: 4px;
  font-size: 14px;
  margin-top: 12px;
  border-left: 4px solid #c62828;
}

/* Scrollbar styling */
.chat-messages::-webkit-scrollbar {
  width: 8px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #bdbdbd;
  border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #9e9e9e;
}
</style>
