/**
 * Message Type Definitions
 * 
 * Core message structures used throughout the application for
 * representing conversation state and tool interactions.
 * 
 * @module types/messages
 */

export interface ToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;
    };
}

export interface Message {
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string | null;
    tool_calls?: ToolCall[];
    tool_call_id?: string;
    toolCallId?: string;
}
