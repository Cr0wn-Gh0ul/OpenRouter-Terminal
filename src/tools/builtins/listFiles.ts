/**
 * List Files Tool
 * 
 * Built-in tool for listing directory contents.
 * 
 * @module tools/builtins/listFiles
 */
import * as fs from 'fs';
import * as path from 'path';
import type { ToolDefinition } from '../types';
import { formatSize, resolvePath } from './utils';

export const listFilesTool: ToolDefinition = {
    name: 'list_files',
    description: 'List files and directories in a specified path. Returns file names, types (file/directory), and sizes.',
    parameters: {
        type: 'object',
        properties: {
            path: {
                type: 'string',
                description: 'The directory path to list. Use "~" for home directory, "." for current directory.',
            },
            showHidden: {
                type: 'boolean',
                description: 'Whether to show hidden files (starting with .)',
            },
        },
        required: ['path'],
    },
    execute: async (args) => {
        const targetPath = resolvePath(args.path as string);
        const showHidden = args.showHidden as boolean ?? false;

        if (!fs.existsSync(targetPath)) {
            return `Error: Path does not exist: ${targetPath}`;
        }

        const stat = fs.statSync(targetPath);
        if (!stat.isDirectory()) {
            return `Error: Path is not a directory: ${targetPath}`;
        }

        try {
            const entries = fs.readdirSync(targetPath, { withFileTypes: true });
            const results: string[] = [];

            for (const entry of entries) {
                // Skip hidden files unless requested
                if (!showHidden && entry.name.startsWith('.')) {
                    continue;
                }

                const fullPath = path.join(targetPath, entry.name);
                let info = '';

                try {
                    const entryStat = fs.statSync(fullPath);
                    if (entry.isDirectory()) {
                        info = `[DIR]  ${entry.name}/`;
                    } else {
                        const size = formatSize(entryStat.size);
                        info = `[FILE] ${entry.name} (${size})`;
                    }
                } catch {
                    info = `[?]    ${entry.name}`;
                }

                results.push(info);
            }

            if (results.length === 0) {
                return `Directory is empty: ${targetPath}`;
            }

            return `Contents of ${targetPath}:\n${results.join('\n')}`;
        } catch (error) {
            return `Error reading directory: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    },
};
