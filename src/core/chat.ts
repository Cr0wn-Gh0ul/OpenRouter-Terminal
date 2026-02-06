/**
 * Chat Message Streaming
 * 
 * Handles streaming chat interactions with the OpenRouter API.
 * Orchestrates the agent loop and tracks token usage.
 * 
 * @module core/chat
 */
import type { Message } from '../types';
import { runAgentLoop, AgentLoopResult } from './agent';
import { trackUsage, displayMessageUsage, TokenUsage } from '../usage';

export interface StreamResult {
    response: string;
    usage?: TokenUsage;
}

export async function streamMessage(
    userMessage: string,
    conversationHistory: Message[],
    model: string,
    apiKey: string
): Promise<StreamResult> {
    if (!apiKey) {
        throw new Error('No API key set. Use -k <key> to set one, or add it to config.');
    }

    if (!model) {
        throw new Error('No model set. Use -m <model> to set one, add it to config.');
    }

    conversationHistory.push({ role: 'user', content: userMessage });

    const result = await runAgentLoop(conversationHistory, model);

    if (result.usage.totalTokens > 0) {
        const usageWithCost = trackUsage(result.usage, model);
        displayMessageUsage(usageWithCost);
    }

    return { response: result.response, usage: result.usage };
}
