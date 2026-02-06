/**
 * One-Shot Mode
 * 
 * Sends a single message to the AI and exits.
 * Used for non-interactive scripting and piping scenarios.
 * 
 * @module oneshot
 */
import type { Message } from '../types';
import { streamMessage } from '../core';
import { loadContextFiles, buildMessageWithContext } from '../context';
import { loadModelPricing } from '../usage';
import { formatError } from '../ui';

export async function oneshotMode(
    message: string,
    conversationHistory: Message[],
    model: string,
    apiKey: string,
    maxIterations: number = 10
): Promise<void> {
    try {
        await loadModelPricing(apiKey);

        const contextFiles = loadContextFiles();
        const messageWithContext = buildMessageWithContext(message, contextFiles);

        await streamMessage(messageWithContext, conversationHistory, model, apiKey, { maxIterations });
        console.log();
    } catch (error) {
        console.error(formatError(error instanceof Error ? error.message : 'An error occurred'));
        process.exit(1);
    }
}
