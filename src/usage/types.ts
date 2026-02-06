/**
 * Usage Type Definitions
 * 
 * Structures for tracking token consumption and associated costs.
 * 
 * @module usage/types
 */

export interface TokenUsage {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
}

export interface UsageWithCost extends TokenUsage {
    promptCost: number;
    completionCost: number;
    totalCost: number;
}

export interface SessionUsage {
    messages: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    totalCost: number;
}
