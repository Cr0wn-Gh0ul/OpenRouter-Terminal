/**
 * Tool Type Definitions
 * 
 * Defines the interfaces for tool definitions, OpenRouter tool format,
 * and tool call structures.
 * 
 * @module tools/types
 */

// Tool definition - tools must export an object matching this interface
export interface ToolDefinition {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, {
            type: string;
            description?: string;
            enum?: string[];
        }>;
        required?: string[];
    };
    execute: (args: Record<string, unknown>) => Promise<string>;
}

// OpenRouter API tool format
export interface OpenRouterTool {
    type: 'function';
    function: {
        name: string;
        description: string;
        parameters: ToolDefinition['parameters'];
    };
}

// Tool call request from the model
export interface ToolCall {
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;
    };
}

// Converts a ToolDefinition to OpenRouter API format
export function toOpenRouterTool(tool: ToolDefinition): OpenRouterTool {
    return {
        type: 'function',
        function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
        },
    };
}
