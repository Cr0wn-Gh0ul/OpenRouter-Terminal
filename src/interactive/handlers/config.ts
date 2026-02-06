/**
 * Configuration Command Handlers
 * 
 * Handlers for configuration: viewing config, setting system prompt, API key.
 * 
 * @module interactive/handlers/config
 */
import type { InteractiveState, HandlerResult } from '../state';
import { readConfig, updateConfig, getConfigPath, buildSystemPrompt } from '../../config';
import { initClient } from '../../core';
import { formatKeyValue, formatInfo } from '../../ui';

export async function handleShowConfig(_input: string, _state: InteractiveState): Promise<HandlerResult> {
    Object.entries(readConfig()).forEach(([key, value]) => {
        console.log(formatKeyValue(key, value));
    });
    console.log(formatInfo(`Config path: ${getConfigPath()}`));
    console.log();
    return { continue: true };
}

export async function handleSetSystem(input: string, state: InteractiveState): Promise<HandlerResult> {
    const newPrompt = input.slice(7).trim();
    state.options.system = newPrompt;
    updateConfig({ systemPrompt: newPrompt });
    state.conversationHistory.length = 0;
    state.conversationHistory.push({
        role: 'system',
        content: buildSystemPrompt(newPrompt)
    });
    console.log(formatInfo('System prompt updated.\n'));
    return { continue: true };
}

export async function handleSetKey(input: string, state: InteractiveState): Promise<HandlerResult> {
    const newKey = input.slice(4).trim();
    if (!newKey) {
        console.log(formatInfo('Usage: key <apikey>\n'));
        return { continue: true };
    }
    state.options.apiKey = newKey;
    state.apiKey = newKey;
    updateConfig({ apiKey: newKey });
    initClient(newKey);
    console.log(formatInfo('API key updated and saved.\n'));
    return { continue: true };
}
