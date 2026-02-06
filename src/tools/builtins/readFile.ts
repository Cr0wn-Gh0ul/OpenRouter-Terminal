/**
 * Read File Tool
 * 
 * Built-in tool for reading file contents.
 * 
 * @module tools/builtins/readFile
 */
import * as fs from 'fs';
import type { ToolDefinition } from '../types';
import { formatSize, resolvePath } from './utils';

export const readFileTool: ToolDefinition = {
    name: 'read_file',
    description: 'Read the contents of a file. Can read entire file or specific line range.',
    parameters: {
        type: 'object',
        properties: {
            path: {
                type: 'string',
                description: 'The file path to read. Use "~" for home directory.',
            },
            startLine: {
                type: 'number',
                description: 'Start reading from this line number (1-based). Optional.',
            },
            endLine: {
                type: 'number',
                description: 'Stop reading at this line number (inclusive). Optional.',
            },
            maxLines: {
                type: 'number',
                description: 'Maximum number of lines to return (default: 100).',
            },
        },
        required: ['path'],
    },
    execute: async (args) => {
        const filePath = resolvePath(args.path as string);
        const startLine = (args.startLine as number) || 1;
        const endLine = args.endLine as number | undefined;
        const maxLines = (args.maxLines as number) || 100;

        if (!fs.existsSync(filePath)) {
            return `Error: File does not exist: ${filePath}`;
        }

        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            return `Error: Path is a directory, not a file: ${filePath}`;
        }

        // Check file size (limit to 1MB)
        if (stat.size > 1024 * 1024) {
            return `Error: File is too large (${formatSize(stat.size)}). Maximum size is 1MB.`;
        }

        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n');
            const totalLines = lines.length;

            // Calculate line range
            const start = Math.max(1, startLine) - 1;
            const end = endLine ? Math.min(endLine, totalLines) : Math.min(start + maxLines, totalLines);

            const selectedLines = lines.slice(start, end);
            const lineNumbers = selectedLines.map((line, i) => `${start + i + 1}: ${line}`);

            let result = `File: ${filePath} (${totalLines} lines total)\n`;
            result += `Showing lines ${start + 1}-${end}:\n\n`;
            result += lineNumbers.join('\n');

            if (end < totalLines) {
                result += `\n\n... (${totalLines - end} more lines)`;
            }

            return result;
        } catch (error) {
            return `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    },
};
