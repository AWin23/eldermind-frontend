// ---------------------------------------------
// chat.ts
// Shared type definitions for chat messages.
// These are used across components, hooks,
// and API service modules to ensure consistent
// structure and typing.
// ---------------------------------------------

// Role values compatible with OpenAI + backend DTOs
export type ChatRole = 'user' | 'assistant' | 'system';

// Represents a single chat message in the conversation
export interface ChatMessage {
  id: string;           // Unique local ID for React rendering
  role: ChatRole;       // Who sent the message
  content: string;      // Message text content
  createdAt: string;    // ISO timestamp for sorting/logging
}
