/**
 * Model Pricing and Cost Calculation
 * 
 * Fetches and caches model pricing data from OpenRouter API,
 * and calculates costs based on token usage.
 * 
 * @module usage/pricing
 */
import { fetchModels } from '../models';
import type { TokenUsage, UsageWithCost } from './types';

let modelPricingCache: Map<string, { prompt: number; completion: number }> = new Map();
let modelsCacheTime: number = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function loadModelPricing(apiKey: string): Promise<void> {
    const now = Date.now();
    if (modelPricingCache.size > 0 && now - modelsCacheTime < CACHE_TTL_MS) {
        return;
    }

    try {
        const models = await fetchModels(apiKey);
        modelPricingCache.clear();
        for (const model of models) {
            modelPricingCache.set(model.id, {
                prompt: parseFloat(model.pricing.prompt),
                completion: parseFloat(model.pricing.completion),
            });
        }
        modelsCacheTime = now;
    } catch {
        // Silently fail - costs will not be displayed
    }
}

export function getModelPricing(modelId: string): { prompt: number; completion: number } | null {
    return modelPricingCache.get(modelId) || null;
}

// Returns zero costs if pricing is not cached
export function calculateCost(usage: TokenUsage, modelId: string): UsageWithCost {
    const pricing = getModelPricing(modelId);

    if (!pricing) {
        return {
            ...usage,
            promptCost: 0,
            completionCost: 0,
            totalCost: 0,
        };
    }

    const promptCost = usage.promptTokens * pricing.prompt;
    const completionCost = usage.completionTokens * pricing.completion;
    const totalCost = promptCost + completionCost;

    return {
        ...usage,
        promptCost,
        completionCost,
        totalCost,
    };
}
