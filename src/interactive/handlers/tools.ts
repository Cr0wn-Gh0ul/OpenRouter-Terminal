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
import { formatError, formatSuccess, formatInfo, formatMuted } from '../../ui';

export async function handleListTools(_input: string, _state: InteractiveState): Promise<HandlerResult> {
    listTools();
    return { continue: true };
}

export async function handleToolsAdd(input: string, _state: InteractiveState): Promise<HandlerResult> {
    const toolPath = input.slice(10).trim();
    if (!toolPath) {
        console.log(formatError('Please provide a path to a tool file or directory.'));
        return { continue: true };
    }

    const absolutePath = path.resolve(toolPath);

    if (!fs.existsSync(absolutePath)) {
        console.log(formatError(`Path not found: ${absolutePath}`));
        return { continue: true };
    }

    const config = readConfig();
    const currentPaths = config.toolPaths || [];

    if (currentPaths.includes(absolutePath)) {
        console.log(formatInfo('Tool path already registered.'));
    } else {
        const beforeCount = getCustomTools().length;
        await loadToolsFromPaths([absolutePath]);
        const afterCount = getCustomTools().length;
        const added = afterCount - beforeCount;

        if (added > 0) {
            const newPaths = [...currentPaths, absolutePath];
            updateConfig({ toolPaths: newPaths });
            console.log(formatSuccess(`Added tool path: ${absolutePath}`));
            console.log(formatInfo(`Loaded ${added} new tool(s). Total: ${afterCount} custom tools.\n`));
        } else {
            console.log(formatInfo(`No valid tools found in: ${absolutePath}`));
            console.log(formatMuted('Tools must export: name, description, parameters, execute\n'));
        }
    }
    return { continue: true };
}
