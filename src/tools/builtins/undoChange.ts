/**
 * Undo File Change Tool
 * 
 * Reverts a previous file change using the change ID.
 * 
 * @module tools/builtins/undoChange
 */
import * as fs from 'fs';
import * as path from 'path';
import type { ToolDefinition } from '../types';
import { fileHistory } from './fileHistory';

export const undoChangeTool: ToolDefinition = {
    name: 'undo_change',
    description: 'Undo a previous file change by its change ID. Use list_changes to see recent changes and their IDs.',
    parameters: {
        type: 'object',
        properties: {
            changeId: {
                type: 'string',
                description: 'The change ID to undo (from a previous write_file or edit_file operation).',
            },
        },
        required: ['changeId'],
    },
    execute: async (args) => {
        try {
            const change = fileHistory.getById(args.changeId as string);
            
            if (!change) {
                const recent = fileHistory.getRecent(5);
                if (recent.length === 0) {
                    return 'Error: No changes in history to undo.';
                }
                return `Error: Change ID not found: ${args.changeId}\n\n` +
                       `Recent changes:\n` +
                       recent.map(c => `  ${c.id}: ${c.description}`).join('\n');
            }

            // Perform the undo based on operation type
            if (change.operation === 'create') {
                // File was created - delete it
                if (fs.existsSync(change.filePath)) {
                    fs.unlinkSync(change.filePath);
                    fileHistory.remove(change.id);
                    return `Undone: Deleted created file ${change.filePath}`;
                } else {
                    fileHistory.remove(change.id);
                    return `File already doesn't exist: ${change.filePath}`;
                }
            } else if (change.operation === 'edit') {
                // File was edited - restore previous content
                if (change.previousContent === null) {
                    return `Error: No previous content recorded for this change.`;
                }
                
                fs.writeFileSync(change.filePath, change.previousContent, 'utf-8');
                fileHistory.remove(change.id);
                return `Undone: Restored ${change.filePath} to previous state`;
                
            } else if (change.operation === 'delete') {
                // File was deleted - recreate it
                if (change.previousContent !== null) {
                    const dir = path.dirname(change.filePath);
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true });
                    }
                    fs.writeFileSync(change.filePath, change.previousContent, 'utf-8');
                    fileHistory.remove(change.id);
                    return `Undone: Restored deleted file ${change.filePath}`;
                }
                return `Error: Cannot restore deleted file - no content recorded.`;
            }

            return `Error: Unknown operation type: ${change.operation}`;

        } catch (error) {
            return `Error undoing change: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    },
};

export const listChangesTool: ToolDefinition = {
    name: 'list_changes',
    description: 'List recent file changes that can be undone.',
    parameters: {
        type: 'object',
        properties: {
            count: {
                type: 'number',
                description: 'Number of recent changes to show. Default: 10',
            },
        },
        required: [],
    },
    execute: async (args) => {
        const count = (args.count as number) || 10;
        const changes = fileHistory.getRecent(count);
        
        if (changes.length === 0) {
            return 'No file changes in history.';
        }

        const lines = changes.map((c, i) => {
            const time = c.timestamp.toLocaleTimeString();
            return `${i + 1}. [${c.id}] ${time}\n   ${c.description}`;
        });

        return `Recent changes (${changes.length} total):\n\n${lines.join('\n\n')}`;
    },
};
