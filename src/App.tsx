import { useState } from 'react';
import type { FormEvent } from 'react';
import { useChat } from './hooks/useChat';
import type { ChatMessage } from './types/chat';
import './App.css'; 
import './styles/markdown.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Persona } from './types/persona';

const PERSONA_OPTIONS: { id: Persona; label: string; subtitle: string }[] = [
  { id: 'scholar',      label: 'Scholar',      subtitle: 'Canon-first, analytical' },
  { id: 'in-character', label: 'In-Character', subtitle: 'Answer as an NPC' },
  { id: 'npc',          label: 'Townsperson',  subtitle: 'Casual in-universe tone' },
  { id: 'daedric',      label: 'Daedric',      subtitle: 'Cryptic, ominous riddles' },
];


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

  // Function to unescape special characters in message content
  function unescapeContent(text: string): string {
    if (!text) return '';
    return text
      .replace(/\\n/g, '\n')        // convert "\n" → actual newline
      .replace(/\\t/g, '\t')        // convert "\t" if present
      .replace(/\\r/g, '\r');       // convert "\r" if present
  }


  // Extract reactive chat state + methods from our custom hook
  const { messages, isLoading, error, sendUserMessage, persona, setPersona } = useChat();

  
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
          <div className="message-content markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {unescapeContent(message.content)}
            </ReactMarkdown>
          </div>
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

        {/* Left Header: Title + Subtitle + Persona Bar */}
        <div className="chat-header-left">
          <div className="chat-header-text">
            <h1 className="chat-title">ElderMind</h1>
            <p className="chat-subtitle">Your Elder Scrolls lore companion</p>
          </div>

          {/* Persona selector */}
          <div className="persona-bar">
            <span className="persona-label">Persona</span>
            <div className="persona-options">
              {PERSONA_OPTIONS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPersona(p.id)}
                  className={
                    'persona-pill' +
                    (persona === p.id ? ' persona-pill-active' : '')
                  }
                >
                  <span className="persona-pill-label">{p.label}</span>
                  <span className="persona-pill-subtitle">{p.subtitle}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI "typing" indicator while waiting for backend */}
        {isLoading && (
          <span className="chat-status">ElderMind is thinking…</span>
        )}
      </header>

      {/* ---------------- Messages Area ---------------- */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-empty-state">
            Ask anything about Tamriel, its history, factions, or characters to
            begin your journey.
          </div>
        )}

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
          disabled={isLoading}
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
