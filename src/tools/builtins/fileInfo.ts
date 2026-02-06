/**
 * File Info Tool
 * 
 * Built-in tool for retrieving file or directory metadata.
 * 
 * @module tools/builtins/fileInfo
 */
import * as fs from 'fs';
import type { ToolDefinition } from '../types';
import { formatSize, resolvePath } from './utils';

export const fileInfoTool: ToolDefinition = {
    name: 'file_info',
    description: 'Get detailed information about a file or directory (size, permissions, modification date, etc.)',
    parameters: {
        type: 'object',
        properties: {
            path: {
                type: 'string',
                description: 'The file or directory path.',
            },
        },
        required: ['path'],
    },
    execute: async (args) => {
        const targetPath = resolvePath(args.path as string);

        if (!fs.existsSync(targetPath)) {
            return `Error: Path does not exist: ${targetPath}`;
        }

        try {
            const stat = fs.statSync(targetPath);
            const info: string[] = [
                `Path: ${targetPath}`,
                `Type: ${stat.isDirectory() ? 'Directory' : stat.isFile() ? 'File' : 'Other'}`,
                `Size: ${formatSize(stat.size)}`,
                `Created: ${stat.birthtime.toISOString()}`,
                `Modified: ${stat.mtime.toISOString()}`,
                `Accessed: ${stat.atime.toISOString()}`,
                `Permissions: ${(stat.mode & 0o777).toString(8)}`,
            ];

            return info.join('\n');
        } catch (error) {
            return `Error getting file info: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    },
};
