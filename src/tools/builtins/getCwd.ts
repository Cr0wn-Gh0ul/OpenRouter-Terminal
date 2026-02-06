/**
 * Get Current Working Directory Tool
 * 
 * Built-in tool for retrieving the current working directory.
 * 
 * @module tools/builtins/getCwd
 */
import type { ToolDefinition } from '../types';

export const getWorkingDirectoryTool: ToolDefinition = {
    name: 'get_cwd',
    description: 'Get the current working directory.',
    parameters: {
        type: 'object',
        properties: {},
        required: [],
    },
    execute: async () => {
        return process.cwd();
    },
};
