/**
 * Model Type Definitions
 * 
 * Type definitions for OpenRouter API model responses.
 * 
 * @module models/types
 */

export interface OpenRouterModel {
    id: string;
    name: string;
    description?: string;
    pricing: {
        prompt: string;
        completion: string;
    };
    context_length: number;
}

export interface ModelsResponse {
    data: OpenRouterModel[];
}
