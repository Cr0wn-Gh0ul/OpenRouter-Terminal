/**
 * Tools Command Handlers
 * 
 * Handlers for tool management: listing and adding tools.
 * 
 * @module interactive/handlers/tools
 */
import * as fs from 'fs';
import * as path from 'path';
import type { InteractiveState, HandlerResult } from '../state';
import { listTools, loadToolsFromPaths, getCustomTools } from '../../tools';
import { readConfig, updateConfig } from '../../config';
import { expandGlob } from '../../context';
import { formatError, formatSuccess, formatInfo, formatMuted } from '../../ui';

export async function handleListTools(_input: string, _state: InteractiveState): Promise<HandlerResult> {
    listTools();
    return { continue: true };
}

export async function handleToolsAdd(input: string, _state: InteractiveState): Promise<HandlerResult> {
    const toolArg = input.slice(10).trim();
    if (!toolArg) {
        console.log(formatError('Please provide a path to a tool file or directory.'));
        return { continue: true };
    }

    // Support multiple paths and glob patterns
    const patterns = toolArg.split(/\s+/);
    const toolPaths = patterns.flatMap(pattern => expandGlob(pattern));
    
    if (toolPaths.length === 0) {
        console.log(formatError(`No files matched: ${toolArg}`));
        return { continue: true };
    }

    const config = readConfig();
    const currentPaths = config.toolPaths || [];
    const newPaths = [...currentPaths];
    let totalAdded = 0;

    for (const toolPath of toolPaths) {
        const absolutePath = path.isAbsolute(toolPath) ? toolPath : path.resolve(toolPath);

        if (!fs.existsSync(absolutePath)) {
            console.log(formatError(`Path not found: ${absolutePath}`));
            continue;
        }

        if (currentPaths.includes(absolutePath) || newPaths.includes(absolutePath)) {
            console.log(formatInfo(`Already registered: ${absolutePath}`));
            continue;
        }

        const beforeCount = getCustomTools().length;
        await loadToolsFromPaths([absolutePath]);
        const afterCount = getCustomTools().length;
        const added = afterCount - beforeCount;

        if (added > 0) {
            newPaths.push(absolutePath);
            console.log(formatSuccess(`Added: ${absolutePath} (${added} tool${added > 1 ? 's' : ''})`));
            totalAdded += added;
        } else {
            console.log(formatInfo(`No valid tools in: ${absolutePath}`));
        }
    }

    if (newPaths.length > currentPaths.length) {
        updateConfig({ toolPaths: newPaths });
    }
    
    if (totalAdded > 0) {
        console.log(formatInfo(`\nLoaded ${totalAdded} new tool(s). Total: ${getCustomTools().length} custom tools.\n`));
    } else {
        console.log(formatMuted('\nTools must export: name, description, parameters, execute\n'));
    }
    
    return { continue: true };
}
