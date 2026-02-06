/**
 * Conversation History Management
 * 
 * Utilities for displaying and manipulating conversation history,
 * including branching functionality for exploring alternative responses.
 * 
 * @module session/history
 */
import type { Message } from '../types';
import { colors } from '../ui';

export function showHistory(messages: Message[]): void {
    console.log(colors.primary('\nConversation History:'));
    let messageNum = 0;

    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const role = msg.role;
        const content = msg.content || '';
        const preview = content.length > 80 ? content.slice(0, 80) + '...' : content;

        if (role === 'system') {
            console.log(colors.muted(`  [${messageNum}] system: ${preview}`));
        } else if (role === 'user') {
            console.log(colors.prompt(`  [${messageNum}] user: ${preview}`));
        } else if (role === 'assistant') {
            console.log(colors.assistant(`  [${messageNum}] assistant: ${preview}`));
        } else if (role === 'tool') {
            console.log(colors.secondary(`  [${messageNum}] tool: ${preview}`));
        }
        messageNum++;
    }
    console.log();
}

// Returns false if index is invalid
export function branchAtMessage(messages: Message[], index: number): boolean {
    if (index < 0 || index >= messages.length) {
        return false;
    }
    messages.length = index + 1;
    return true;
}
