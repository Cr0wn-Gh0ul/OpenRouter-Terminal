/**
 * File Change Command Handlers
 * 
 * Handlers for undo and changes commands.
 * 
 * @module interactive/handlers/fileChanges
 */
import type { InteractiveState, HandlerResult } from '../state';
import { fileHistory } from '../../tools/builtins/fileHistory';
import { colors } from '../../ui';
import * as fs from 'fs';
import * as path from 'path';

export async function handleUndo(input: string, _state: InteractiveState): Promise<HandlerResult> {
    const parts = input.trim().split(/\s+/);
    const changeId = parts[1];

    // Get recent changes
    const recent = fileHistory.getRecent(10);

    if (recent.length === 0) {
        console.log(colors.warning('No file changes to undo.'));
        return { continue: true };
    }

    // If no ID provided, undo the most recent
    const change = changeId 
        ? fileHistory.getById(changeId)
        : recent[0];

    if (!change) {
        console.log(colors.error(`Change not found: ${changeId}`));
        console.log(colors.muted('\nRecent changes:'));
        recent.slice(0, 5).forEach(c => {
            console.log(colors.muted(`  ${c.id}: ${c.description}`));
        });
        return { continue: true };
    }

    try {
        // Perform the undo
        if (change.operation === 'create') {
            if (fs.existsSync(change.filePath)) {
                fs.unlinkSync(change.filePath);
                console.log(colors.success(`Undone: Deleted created file ${change.filePath}`));
            } else {
                console.log(colors.warning(`File already deleted: ${change.filePath}`));
            }
        } else if (change.operation === 'edit') {
            if (change.previousContent !== null) {
                fs.writeFileSync(change.filePath, change.previousContent, 'utf-8');
                console.log(colors.success(`Undone: Restored ${change.filePath}`));
            } else {
                console.log(colors.error('No previous content to restore.'));
                return { continue: true };
            }
        } else if (change.operation === 'delete') {
            if (change.previousContent !== null) {
                const dir = path.dirname(change.filePath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                fs.writeFileSync(change.filePath, change.previousContent, 'utf-8');
                console.log(colors.success(`Undone: Restored deleted file ${change.filePath}`));
            } else {
                console.log(colors.error('Cannot restore - no content recorded.'));
                return { continue: true };
            }
        }

        fileHistory.remove(change.id);

    } catch (error) {
        console.log(colors.error(`Error undoing change: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }

    return { continue: true };
}

export async function handleChanges(_input: string, _state: InteractiveState): Promise<HandlerResult> {
    const changes = fileHistory.getRecent(10);

    if (changes.length === 0) {
        console.log(colors.muted('No file changes in history.'));
        return { continue: true };
    }

    console.log(colors.header('\nRecent File Changes'));
    console.log(colors.muted('─'.repeat(50)));

    changes.forEach((change, i) => {
        const time = change.timestamp.toLocaleTimeString();
        const op = change.operation === 'create' ? colors.success('CREATE') 
                 : change.operation === 'edit' ? colors.warning('EDIT  ')
                 : colors.error('DELETE');
        
        console.log(`${colors.muted(`${i + 1}.`)} ${op} ${colors.secondary(change.filePath)}`);
        console.log(`   ${colors.muted(`ID: ${change.id} | ${time}`)}`);
    });

    console.log();
    console.log(colors.muted(`Use 'undo' to revert the last change, or 'undo <id>' for a specific one.`));
    console.log();

    return { continue: true };
}
