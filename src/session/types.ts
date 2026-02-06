/**
 * Session Type Definitions
 * 
 * Defines the structure for persisted conversation sessions.
 * 
 * @module session/types
 */
import type { Message } from '../types';

export interface Session {
    name: string;
    model: string;
    systemPrompt?: string;
    messages: Message[];
    createdAt: string;
    updatedAt: string;
}
