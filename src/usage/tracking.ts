/**
 * Session Usage Tracking
 * 
 * Maintains cumulative usage statistics for the current session.
 * Tracks message counts, token consumption, and costs.
 * 
 * @module usage/tracking
 */
import type { SessionUsage, TokenUsage, UsageWithCost } from './types';
import { calculateCost } from './pricing';

let sessionUsage: SessionUsage = {
    messages: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    totalCost: 0,
};

export function resetSessionUsage(): void {
    sessionUsage = {
        messages: 0,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        totalCost: 0,
    };
}

export function getSessionUsage(): SessionUsage {
    return { ...sessionUsage };
}

export function trackUsage(usage: TokenUsage, modelId: string): UsageWithCost {
    const usageWithCost = calculateCost(usage, modelId);

    sessionUsage.messages++;
    sessionUsage.promptTokens += usage.promptTokens;
    sessionUsage.completionTokens += usage.completionTokens;
    sessionUsage.totalTokens += usage.totalTokens;
    sessionUsage.totalCost += usageWithCost.totalCost;

    return usageWithCost;
}
