/**
 * Write File Tool
 * 
 * Creates or overwrites a file with content.
 * Records changes for undo capability.
 * 
 * @module tools/builtins/writeFile
 */
import * as fs from 'fs';
import * as path from 'path';
import type { ToolDefinition } from '../types';
import { resolvePath } from './utils';
import { fileHistory } from './fileHistory';

export const writeFileTool: ToolDefinition = {
    name: 'write_file',
    description: 'Create a new file or overwrite an existing file with the specified content. Use for creating new files or completely replacing file contents. For partial edits, use edit_file instead.',
    parameters: {
        type: 'object',
        properties: {
            path: {
                type: 'string',
                description: 'Path to the file to write. Can be absolute or relative to current directory.',
            },
            content: {
                type: 'string',
                description: 'The content to write to the file.',
            },
            createDirs: {
                type: 'boolean',
                description: 'Create parent directories if they don\'t exist. Default: true',
            },
        },
        required: ['path', 'content'],
    },
    execute: async (args) => {
        try {
            const filePath = resolvePath(args.path as string);
            const content = args.content as string;
            const createDirs = args.createDirs !== false;
            
            // Check if file exists and get previous content for undo
            let previousContent: string | null = null;
            let operation: 'create' | 'edit' = 'create';
            
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                if (stats.isDirectory()) {
                    return `Error: Path is a directory: ${filePath}`;
                }
                previousContent = fs.readFileSync(filePath, 'utf-8');
                operation = 'edit';
            }

            // Create parent directories if needed
            const dir = path.dirname(filePath);
            if (createDirs && !fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Write the file
            fs.writeFileSync(filePath, content, 'utf-8');

            // Record for undo
            const changeId = fileHistory.record({
                filePath,
                operation,
                previousContent,
                newContent: content,
                description: operation === 'create' 
                    ? `Created file: ${path.basename(filePath)}`
                    : `Overwrote file: ${path.basename(filePath)}`,
            });

            const lines = content.split('\n').length;
            const bytes = Buffer.byteLength(content, 'utf-8');

            return `${operation === 'create' ? 'Created' : 'Wrote'} ${filePath}\n` +
                   `${lines} lines, ${bytes} bytes\n` +
                   `[Change ID: ${changeId} - can be undone]`;

        } catch (error) {
            return `Error writing file: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    },
};
