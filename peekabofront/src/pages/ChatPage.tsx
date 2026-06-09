import React, { useRef, useState } from 'react';
import './ChatPage.css';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 0);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError(null);

    const updatedMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(updatedMessages);
    setLoading(true);
    scrollToBottom();

    try {
      const response = await fetch('/llm/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');
      const decoder = new TextDecoder();
      let assistantContent = '';
      let buffer = '';

      const msgIndex = updatedMessages.length;
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      let frameCount = 0;
      while (true) {
        const result = await reader.read();
        if (result.done) break;

        buffer += decoder.decode(result.value, { stream: true });
        const parts = buffer.split('\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          if (part.startsWith('data: ')) {
            const data = part.slice(6);
            if (data === '[DONE]') break;
            assistantContent += data;
          }
        }

        // Capture snapshot so React 18 batching sees per-chunk values
        // instead of the live mutable variable at render time
        const snapshot = assistantContent;
        setMessages((prev) => {
          const next = [...prev];
          next[msgIndex] = { role: 'assistant', content: snapshot };
          return next;
        });
        scrollToBottom();

        frameCount++;
        if (frameCount % 8 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${message}` }]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInputMessage('');
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Chat with LLM</h1>
        <button className="clear-btn" onClick={clearChat}>
          Clear Chat
        </button>
      </div>

      <div className="chat-messages" ref={messagesContainerRef}>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">{message.content}</div>
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <div className="message-content loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <textarea
          className="input-field"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here... (Ctrl+Enter to send)"
          disabled={loading}
        />
        <button
          className="send-btn"
          onClick={sendMessage}
          disabled={!inputMessage.trim() || loading}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default ChatPage;
