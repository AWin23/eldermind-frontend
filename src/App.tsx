import { useState } from 'react';
import type { FormEvent } from 'react';
import { useChat } from './hooks/useChat';
import type { ChatMessage } from './types/chat';
import './App.css'; 

// --------------------------------------------------------------
// App.tsx
// Root component for the ElderMind frontend.
//
// Responsibilities:
//   • Initialize chat state through useChat()
//   • Render the UI (header, messages, input box)
//   • Display messages from both user + assistant
//   • Handle sending new messages to backend
//
// This component intentionally keeps logic simple.
// UI will later be refactored into ChatWindow, MessageList,
// MessageBubble, etc., but this is a clean working baseline.
// --------------------------------------------------------------

function App() {
  // Extract reactive chat state + methods from our custom hook
  const { messages, isLoading, error, sendUserMessage } = useChat();

  // Local input field state (controlled input)
  const [input, setInput] = useState('');

  // --------------------------------------------------------------
  // Handles when the user presses "Send".
  // Prevents page reload, validates message,
  // sends to backend through useChat(), and then clears input.
  // --------------------------------------------------------------
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    await sendUserMessage(trimmed);
    setInput('');
  }

  // --------------------------------------------------------------
  // Renders a single chat message bubble.
  // Adds a safety guard so undefined messages don't crash the app.
  // --------------------------------------------------------------
  function renderMessage(message: ChatMessage | undefined, index: number) {
    if (!message) {
      console.warn('[App] Skipping undefined message at index', index);
      return null;
    }

    const isUser = message.role === 'user';
    const label = isUser ? 'You' : 'ElderMind';

    return (
      <div
        key={message.id}
        className={
          'message-row ' +
          (isUser ? 'message-row-user' : 'message-row-assistant')
        }
      >
        <div
          className={
            'message-bubble ' +
            (isUser ? 'message-bubble-user' : 'message-bubble-assistant')
          }
        >
          <div className="message-label">{label}</div>
          <div className="message-content">{message.content}</div>
        </div>
      </div>
    );
  }


  // --------------------------------------------------------------
  // Main UI
  // --------------------------------------------------------------
  return (
    <div className="app-root">
      <div className="chat-container">

        {/* ---------------- Header ---------------- */}
        <header className="chat-header">
          <div className="chat-header-text">
            <h1 className="chat-title">ElderMind</h1>
            <p className="chat-subtitle">Your Elder Scrolls lore companion</p>
          </div>

          {/* AI "typing" indicator while waiting for backend */}
          {isLoading && (
            <span className="chat-status">ElderMind is thinking…</span>
          )}
        </header>

        {/* ---------------- Messages Area ---------------- */}
        <div className="chat-messages">

          {/* Display starter prompt if no messages yet */}
          {messages.length === 0 && (
            <div className="chat-empty-state">
              Ask anything about Tamriel, its history, factions, or characters to
              begin your journey.
            </div>
          )}

          {/* Render each message in conversation history */}
          {messages.map(renderMessage)}
        </div>

        {/* ---------------- Error Message ---------------- */}
        {error && <div className="chat-error">{error}</div>}

        {/* ---------------- Input Bar ---------------- */}
        <form onSubmit={handleSubmit} className="chat-input-area">
          <input
            type="text"
            className="chat-input"
            placeholder="Ask ElderMind about TES lore…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading} // prevents sending while backend is busy
          />

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="chat-send-button"
          >
            Send
          </button>
        </form>

      </div>
    </div>
  );
}

export default App;
