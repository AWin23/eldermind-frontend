// ---------------------------------------------
// eldermindApi.ts
// Contains API calls specific to ElderMind.
// This separates domain logic from low-level
// fetch details, keeping the app modular.
//
// sendChat(messages):
//   • Sends the full message history to
//     the Spring Boot backend
//   • Expects backend to return the NEXT
//     assistant ChatMessage
// ---------------------------------------------

import { apiFetch } from './apiClient';
import type { ChatMessage } from '../types/chat';
import type { Persona } from '../types/persona';
import { v4 as uuidv4 } from 'uuid';

// Adjust this interface to match backend.
// For now, assume backend returns { role, content }.
export interface ChatResponseDto {
  completionTokens: number;
  promptTokens: number;
  reply: string; 
}

export async function sendChat(
  persona: Persona,          // Persona parameter
  messages: ChatMessage[] // ChatMessage array parameter
): Promise<ChatMessage> {
  const payload = {
    persona,  // persona parameter
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  };

  console.log('[eldermindApi] POST /api/chat payload:', payload);

  // If your backend returns a *different* shape, we'll see it here.
  const res = await apiFetch<ChatResponseDto>('/api/chat', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  console.log('[eldermindApi] Raw backend response:', res);

  // Build a proper ChatMessage for the frontend
  const assistantMessage: ChatMessage = {
    id: uuidv4(),
    role: 'assistant',
    content: res.reply,  
    createdAt: new Date().toISOString(),
  };

  return assistantMessage;
}