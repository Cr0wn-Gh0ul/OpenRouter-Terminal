#!/usr/bin/env node
/**
 * OpenRouter Terminal - Main Entry Point
 * 
 * This module serves as the application bootstrap. It handles:
 * - Environment and configuration loading
 * - CLI argument parsing and validation
 * - Session restoration from saved state
 * - Client initialization and mode dispatch (interactive vs oneshot)
 * 
 * @module index
 */
import 'dotenv/config';
import chalk from 'chalk';
import { title } from './ui/title';
import { createProgram, parseArgs, processEarlyFlags, processConfigFlags } from './cli';
import { readConfig } from './config';
import { buildSystemPrompt } from './config/systemPrompt';
import { initClient } from './core';
import { oneshotMode } from './oneshot';
import { interactiveMode } from './interactive';
import { loadToolsFromPaths } from './tools';
import { loadSession } from './session';
import type { Message } from './types/messages';
import type { CLIOptions } from './types/cli';

const config = readConfig();

// Create and parse CLI
const program = createProgram();
const options: CLIOptions = parseArgs(program);

// Handle flags that exit early
processEarlyFlags(options, config);

// Handle flags that update config
processConfigFlags(options);

// Resolve settings: CLI option > config file > default
let resolvedApiKey = config.apiKey || '';
let resolvedModel = config.model || '';
let resolvedSystemPrompt = config.systemPrompt || '';

// Initialize conversation history
const conversationHistory: Message[] = [];

// Load session if specified (--load or --session)
const sessionToLoad = options.load || options.session;
if (sessionToLoad) {
    const session = loadSession(sessionToLoad);
    if (session) {
        console.log(chalk.yellow(`Loaded session: ${session.name}`));
        // Restore messages
        conversationHistory.push(...session.messages);
        // Use session's model if not overridden by CLI
        if (!options.model && session.model) {
            resolvedModel = session.model;
        }
        // Use session's system prompt if not overridden
        if (!options.system && session.systemPrompt) {
            resolvedSystemPrompt = session.systemPrompt;
        }
    } else if (options.load) {
        // --load should fail if session not found
        console.error(chalk.red(`Session not found: ${sessionToLoad}`));
        process.exit(1);
    }
    // --session with non-existent session is fine (will create new)
}

// If no messages loaded, add system prompt
if (conversationHistory.length === 0) {
    const systemPrompt = buildSystemPrompt(resolvedSystemPrompt);
    conversationHistory.push({ role: 'system', content: systemPrompt });
}

// Initialize OpenRouter client
initClient(resolvedApiKey);

(async function(): Promise<void> {
    // Load tools from config paths
    if (config.toolPaths && config.toolPaths.length > 0) {
        await loadToolsFromPaths(config.toolPaths);
    }

    console.log(chalk.green(title));
    if (options.oneshot) {
        await oneshotMode(options.oneshot, conversationHistory, resolvedModel, resolvedApiKey);
    } else {
        await interactiveMode(options, conversationHistory, resolvedModel, resolvedApiKey);
    }
})().catch(error => {
    console.error(chalk.red('An error occurred:'), error instanceof Error ? error.message : error);
    process.exit(1);
});
