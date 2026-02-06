/**
 * Edit File Tool
 * 
 * Edit a file by replacing specific content with new content.
 * Shows a diff preview and records changes for undo.
 * 
 * @module tools/builtins/editFile
 */
import * as fs from 'fs';
import * as path from 'path';
import type { ToolDefinition } from '../types';
import { resolvePath } from './utils';
import { fileHistory } from './fileHistory';

/**
 * Generate a unified diff between two strings
 */
function generateDiff(oldContent: string, newContent: string, filePath: string): string {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    
    const diff: string[] = [];
    diff.push(`--- a/${path.basename(filePath)}`);
    diff.push(`+++ b/${path.basename(filePath)}`);
    
    // Simple line-by-line diff (not optimal but functional)
    let i = 0, j = 0;
    let hunkStart = -1;
    let hunkLines: string[] = [];
    
    const flushHunk = () => {
        if (hunkLines.length > 0 && hunkStart >= 0) {
            diff.push(`@@ -${hunkStart + 1} +${hunkStart + 1} @@`);
            diff.push(...hunkLines);
            hunkLines = [];
            hunkStart = -1;
        }
    };

    while (i < oldLines.length || j < newLines.length) {
        if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
            flushHunk();
            i++;
            j++;
        } else {
            if (hunkStart < 0) hunkStart = Math.max(0, i - 2);
            
            // Show context before
            if (hunkLines.length === 0 && i >= 2) {
                if (i - 2 >= 0) hunkLines.push(` ${oldLines[i - 2] || ''}`);
                if (i - 1 >= 0) hunkLines.push(` ${oldLines[i - 1] || ''}`);
            }
            
            if (i < oldLines.length && (j >= newLines.length || oldLines[i] !== newLines[j])) {
                hunkLines.push(`-${oldLines[i]}`);
                i++;
            }
            if (j < newLines.length && (i >= oldLines.length || oldLines[i] !== newLines[j])) {
                hunkLines.push(`+${newLines[j]}`);
                j++;
            }
        }
    }
    
    flushHunk();
    
    if (diff.length === 2) {
        return 'No changes detected';
    }
    
    return diff.join('\n');
}

export const editFileTool: ToolDefinition = {
    name: 'edit_file',
    description: 'Edit a file by finding and replacing specific text. Provide the exact text to find (including whitespace/indentation) and the replacement text. Shows a diff preview. For creating new files or full rewrites, use write_file instead.',
    parameters: {
        type: 'object',
        properties: {
            path: {
                type: 'string',
                description: 'Path to the file to edit.',
            },
            find: {
                type: 'string',
                description: 'The exact text to find in the file. Must match exactly including whitespace.',
            },
            replace: {
                type: 'string',
                description: 'The text to replace the found text with.',
            },
            all: {
                type: 'boolean',
                description: 'Replace all occurrences instead of just the first. Default: false',
            },
        },
        required: ['path', 'find', 'replace'],
    },
    execute: async (args) => {
        try {
            const filePath = resolvePath(args.path as string);
            const findText = args.find as string;
            const replaceText = args.replace as string;
            const replaceAll = args.all as boolean | undefined;
            
            // Check file exists
            if (!fs.existsSync(filePath)) {
                return `Error: File not found: ${filePath}`;
            }

            const stats = fs.statSync(filePath);
            if (stats.isDirectory()) {
                return `Error: Path is a directory: ${filePath}`;
            }

            // Read current content
            const oldContent = fs.readFileSync(filePath, 'utf-8');
            
            // Check if text exists
            if (!oldContent.includes(findText)) {
                // Try to be helpful about what might be wrong
                const findLines = findText.split('\n').length;
                const hint = findLines > 1 
                    ? 'Tip: Multi-line matches must have exact whitespace/indentation.'
                    : 'Tip: Match is case-sensitive and whitespace-sensitive.';
                return `Error: Text to find not found in file.\n${hint}\n\nSearched for:\n${findText.slice(0, 200)}${findText.length > 200 ? '...' : ''}`;
            }

            // Perform replacement
            let newContent: string;
            let count: number;
            
            if (replaceAll) {
                const parts = oldContent.split(findText);
                count = parts.length - 1;
                newContent = parts.join(replaceText);
            } else {
                count = 1;
                newContent = oldContent.replace(findText, replaceText);
            }

            // Generate diff preview
            const diff = generateDiff(oldContent, newContent, filePath);

            // Write the file
            fs.writeFileSync(filePath, newContent, 'utf-8');

            // Record for undo
            const changeId = fileHistory.record({
                filePath,
                operation: 'edit',
                previousContent: oldContent,
                newContent,
                description: `Edited file: ${path.basename(filePath)} (${count} replacement${count > 1 ? 's' : ''})`,
            });

            return `Edited ${filePath}\n` +
                   `Replaced ${count} occurrence${count > 1 ? 's' : ''}\n` +
                   `[Change ID: ${changeId} - can be undone]\n\n` +
                   `Diff:\n${diff}`;

        } catch (error) {
            return `Error editing file: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    },
};
