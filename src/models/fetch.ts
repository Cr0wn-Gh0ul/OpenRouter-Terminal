/**
 * Model Fetching and Processing
 * 
 * Functions for retrieving and organizing available models
 * from the OpenRouter API.
 * 
 * @module models/fetch
 */
import type { OpenRouterModel, ModelsResponse } from './types';

/**
 * Fetches available models from the OpenRouter API.
 * 
 * @param apiKey - OpenRouter API key for authentication
 * @returns Array of available models, sorted by ID
 * @throws Error if API key is missing or request fails
 */
export async function fetchModels(apiKey: string): Promise<OpenRouterModel[]> {
    if (!apiKey) {
        throw new Error('API key required to fetch models.');
    }

    const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const data = await response.json() as ModelsResponse;
    return data.data.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Groups models by their provider (first part of model ID).
 * 
 * @param models - Array of models to group
 * @returns Map of provider names to their models
 */
export function groupModelsByProvider(models: OpenRouterModel[]): Map<string, OpenRouterModel[]> {
    const providers = new Map<string, OpenRouterModel[]>();
    for (const model of models) {
        const [provider] = model.id.split('/');
        if (!providers.has(provider)) {
            providers.set(provider, []);
        }
        providers.get(provider)!.push(model);
    }
    return providers;
}

/**
 * Formats model pricing for human-readable display.
 * Converts per-token pricing to per-million-tokens format.
 * 
 * @param model - Model with pricing information
 * @returns Formatted pricing string
 */
export function formatModelPricing(model: OpenRouterModel): string {
    const promptPrice = parseFloat(model.pricing.prompt) * 1000000;
    const completionPrice = parseFloat(model.pricing.completion) * 1000000;
    return `$${promptPrice}/M in, $${completionPrice}/M out`;
}
