// ---------------------------------------------
// useChat.ts
// Custom hook responsible for managing chat state.
//
// This hook implements OPTION A: the frontend keeps
// full chat history in memory and sends the entire
// message list to the backend on each request.
//
// Responsibilities:
//   • Store chat messages in React state
//   • Append new user messages
//   • Send the message array to the backend API
//   • Append the assistant reply returned from backend
//   • Expose loading + error states
//
// This keeps the backend completely stateless.
// ---------------------------------------------

import { useState } from 'react';
import type { ChatMessage } from '../types/chat';
import { sendChat } from '../services/eldermindApi';
import { v4 as uuidv4 } from 'uuid';

export function useChat() {
  // Full chat history (managed on the frontend)
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // UI loading indicator during API calls
  const [isLoading, setIsLoading] = useState(false);

  // Error message shown to the user if backend fails
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------
  // Main function that handles user message sending.
  //
  // 1. Add user message to local history
  // 2. POST full history to backend
  // 3. Append assistant response to history
  // ---------------------------------------------
  async function sendUserMessage(text: string) {
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    // Add user message to state immediately for responsive UI
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);

    // Begin backend call
    setIsLoading(true);
    setError(null);

    try {

      // 🔍 Log the message list you’re about to send
      console.log('[useChat] Sending messages to backend:', nextMessages);

      // Backend returns a ChatMessage representing assistant response
      const assistantMessage = await sendChat(nextMessages);

      console.log('[useChat] Received assistant message:', assistantMessage);

      // Append assistant response to UI
      setMessages([...nextMessages, assistantMessage]);
    } catch (err) {
      console.error('Chat API error:', err);
      setError('Something went wrong talking to ElderMind.');
    } finally {
      setIsLoading(false);
    }
  }

  return {
    messages,
    isLoading,
    error,
    sendUserMessage,
  };
}
