/**
 * Output Formatting Utilities
 * 
 * Provides standardized formatting functions for terminal output.
 * Ensures consistent styling across all user-facing messages.
 * 
 * @module ui/format
 */
import { colors } from './colors';

export function formatKeyValue(key: string, value: unknown): string {
    const displayValue = Array.isArray(value) ? value.join(', ') : String(value ?? 'Not set');
    return `${colors.primary(key + ':')} ${colors.secondary(displayValue)}`;
}

export function formatHeader(text: string): string {
    return colors.header(`\n${text}`);
}

export function formatSeparator(length: number = 50): string {
    return colors.separator('-'.repeat(length));
}

export function formatError(message: string): string {
    return colors.error(message);
}

export function formatSuccess(message: string): string {
    return colors.success(message);
}

export function formatInfo(message: string): string {
    return colors.secondary(message);
}

export function formatMuted(message: string): string {
    return colors.muted(message);
}
