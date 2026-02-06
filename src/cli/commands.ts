/**
 * CLI Flag Handlers
 * 
 * Implements handlers for CLI flags that require immediate action,
 * such as displaying configuration or listing sessions.
 * 
 * @module cli/commands
 */
import type { CLIOptions } from '../types';
import { readConfig, updateConfig } from '../config';
import { listTools } from '../tools';
import { listSessions, getSessionsDir } from '../session';
import { loadContextFiles } from '../context';
import { colors, formatKeyValue, formatInfo, formatMuted } from '../ui';

export function handleConfigFlag(config: ReturnType<typeof readConfig>): void {
    Object.entries(config).forEach(([key, value]) => {
        console.log(formatKeyValue(key, value));
    });
    process.exit(0);
}

export function handleToolsFlag(): void {
    listTools();
    process.exit(0);
}

export function handleSessionsFlag(): void {
    const sessions = listSessions();
    if (sessions.length === 0) {
        console.log(formatInfo('No saved sessions found.'));
        console.log(formatMuted(`Sessions directory: ${getSessionsDir()}`));
    } else {
        console.log(colors.primary('Saved sessions:'));
        sessions.forEach(s => console.log(colors.secondary(`  ${s}`)));
    }
    process.exit(0);
}

export function handleContextFlag(): void {
    const contextFiles = loadContextFiles();
    if (contextFiles.size === 0) {
        console.log(formatInfo('No files in context.'));
    } else {
        console.log(colors.primary('Files in context:'));
        for (const [filePath, content] of contextFiles) {
            const lines = content.split('\n').length;
            console.log(colors.secondary(`  ${filePath} (${lines} lines)`));
        }
    }
    process.exit(0);
}

// Processes flags that display information and exit
export function processEarlyFlags(options: CLIOptions, config: ReturnType<typeof readConfig>): void {
    if (options.config) {
        handleConfigFlag(config);
    }

    if (options.tools) {
        handleToolsFlag();
    }

    if (options.sessions) {
        handleSessionsFlag();
    }

    if (options.context) {
        handleContextFlag();
    }
}

// Processes flags that persist configuration changes
export function processConfigFlags(options: CLIOptions): void {
    if (options.apiKey) {
        updateConfig({ apiKey: options.apiKey });
    }

    if (options.model) {
        updateConfig({ model: options.model });
    }

    if (options.system) {
        updateConfig({ systemPrompt: options.system });
    }
}
