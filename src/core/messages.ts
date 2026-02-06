/**
 * Message Format Conversion
 * 
 * Transforms internal message structures to the format expected
 * by the OpenRouter SDK. Handles role-specific transformations
 * for tool calls and responses.
 * 
 * @module core/messages
 */
import type { Message } from '../types';

export function toSDKMessages(messages: Message[]): unknown[] {
    return messages.map(msg => {
        if (msg.role === 'tool') {
            return {
                role: 'tool',
                toolCallId: msg.tool_call_id || msg.toolCallId,
                content: msg.content,
            };
        }
        if (msg.role === 'assistant' && msg.tool_calls) {
            return {
                role: 'assistant',
                content: msg.content,
                toolCalls: msg.tool_calls.map(tc => ({
                    id: tc.id,
                    type: 'function',
                    function: tc.function,
                })),
            };
        }
        return {
            role: msg.role,
            content: msg.content,
        };
    });
}
