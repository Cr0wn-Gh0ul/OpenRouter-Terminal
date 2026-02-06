/**
 * Usage Display Formatting
 * 
 * Formats and displays token usage and cost information
 * in a human-readable format for terminal output.
 * 
 * @module usage/display
 */
import type { UsageWithCost } from './types';
import { getSessionUsage } from './tracking';
import { colors, formatMuted } from '../ui';

export function formatCost(cost: number): string {
    if (cost === 0) return '$0.00';
    if (cost < 0.0001) return `$${cost.toExponential(2)}`;
    if (cost < 0.01) return `$${cost.toFixed(6)}`;
    if (cost < 1) return `$${cost.toFixed(4)}`;
    return `$${cost.toFixed(2)}`;
}

export function formatTokens(tokens: number): string {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
}

export function displayMessageUsage(usage: UsageWithCost): void {
    const promptStr = formatTokens(usage.promptTokens);
    const compStr = formatTokens(usage.completionTokens);
    const costStr = formatCost(usage.totalCost);

    console.log(formatMuted(`\n[${promptStr} in, ${compStr} out | ${costStr}]`));
}

export function displaySessionUsage(): void {
    const usage = getSessionUsage();
    console.log(colors.primary('\nSession Usage:'));
    console.log(colors.secondary(`  Messages: ${usage.messages}`));
    console.log(colors.secondary(`  Tokens:   ${formatTokens(usage.promptTokens)} in, ${formatTokens(usage.completionTokens)} out (${formatTokens(usage.totalTokens)} total)`));
    console.log(colors.secondary(`  Cost:     ${formatCost(usage.totalCost)}`));
    console.log();
}
