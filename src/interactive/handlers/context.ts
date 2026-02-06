/**
 * Context Command Handlers
 * 
 * Handlers for context file management: viewing, adding, clearing.
 * 
 * @module interactive/handlers/context
 */
import type { InteractiveState, HandlerResult } from '../state';
import { addFileToContext, saveContextToConfig, clearContext, expandGlob } from '../../context';
import { colors, formatInfo, formatSuccess, formatError } from '../../ui';

export async function handleShowContext(_input: string, state: InteractiveState): Promise<HandlerResult> {
    if (state.contextFiles.size === 0) {
        console.log(formatInfo('No files in context.\n'));
    } else {
        console.log(colors.primary('\nFiles in context:'));
        for (const [filePath, content] of state.contextFiles) {
            const lines = content.split('\n').length;
            console.log(colors.secondary(`  ${filePath} (${lines} lines)`));
        }
        console.log();
    }
    return { continue: true };
}

export async function handleContextClear(_input: string, state: InteractiveState): Promise<HandlerResult> {
    clearContext(state.contextFiles);
    console.log(formatInfo('Context cleared.\n'));
    return { continue: true };
}

export async function handleContextAdd(input: string, state: InteractiveState): Promise<HandlerResult> {
    const filesArg = input.slice(8).trim();
    const patterns = filesArg.split(/\s+/);
    
    // Expand globs and flatten
    const filePaths = patterns.flatMap(pattern => expandGlob(pattern));
    
    let addedCount = 0;
    for (const filePath of filePaths) {
        const result = addFileToContext(filePath, state.contextFiles);
        if (result.success) {
            console.log(formatSuccess(`Added: ${filePath}`));
            addedCount++;
        } else if (result.error === 'directory') {
            console.log(formatInfo(`Skipping directory: ${filePath}`));
        } else {
            console.log(formatError(`Failed to read: ${filePath}`));
        }
    }
    
    if (addedCount > 0) {
        saveContextToConfig(state.contextFiles);
    }
    console.log(formatInfo(`Total files in context: ${state.contextFiles.size}\n`));
    return { continue: true };
}
