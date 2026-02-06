/**
 * OpenRouter Client Management
 * 
 * Manages the singleton OpenRouter SDK client instance.
 * The client must be initialized with an API key before use.
 * 
 * @module core/client
 */
import { OpenRouter } from '@openrouter/sdk';

let client: OpenRouter | null = null;

export function initClient(apiKey: string): OpenRouter {
    client = new OpenRouter({ apiKey });
    return client;
}

// Throws if client has not been initialized
export function getClient(): OpenRouter {
    if (!client) {
        throw new Error('Client not initialized. Call initClient first.');
    }
    return client;
}
