/**
 * REPL Implementation
 * 
 * Implements the Read-Eval-Print-Loop for interactive mode.
 * Handles user input, command routing, and message streaming.
 * 
 * @module interactive/repl
 */
import * as readline from 'readline';
import type { Message, CLIOptions } from '../types';
import type { InteractiveState } from './state';
import { routeCommand } from './handlers';
import { streamMessage } from '../core';
import { buildMessageWithContext, loadContextFiles } from '../context';
import { saveSession } from '../session';
import { loadModelPricing } from '../usage';
import { colors, getUserPrompt, getAssistantPrompt, formatError, formatInfo } from '../ui';

export async function runRepl(state: InteractiveState): Promise<void> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const prompt = (): void => {
        rl.question(getUserPrompt(), async (input) => {
            const trimmedInput = input.trim();

            if (!trimmedInput) {
                prompt();
                return;
            }

            const handler = routeCommand(trimmedInput);
            if (handler) {
                const result = await handler(trimmedInput, state);

                if (!result.continue) {
                    rl.close();
                    process.exit(0);
                }

                if (result.restart) {
                    rl.close();
                    await runRepl(state);
                    return;
                }

                prompt();
                return;
            }

            try {
                const messageWithContext = buildMessageWithContext(trimmedInput, state.contextFiles);

                process.stdout.write(getAssistantPrompt(state.options.model!));
                await streamMessage(messageWithContext, state.conversationHistory, state.model, state.apiKey);
                console.log('\n');

                if (state.options.session) {
                    const systemMsg = state.conversationHistory.find(m => m.role === 'system');
                    saveSession(state.options.session, state.conversationHistory, state.model, systemMsg?.content || '');
                }
            } catch (error) {
                console.error(formatError(error instanceof Error ? error.message : 'An error occurred'));
            }

            prompt();
        });
    };

    prompt();
}

export async function interactiveMode(
    options: CLIOptions,
    conversationHistory: Message[],
    model: string,
    apiKey: string
): Promise<void> {
    if (!options.model) {
        options.model = model;
    }

    loadModelPricing(apiKey).catch(() => {});

    console.log(colors.info(`OpenRouter Terminal - Using model: ${options.model}`));
    if (options.session) {
        console.log(colors.info(`Session: ${options.session} (auto-saving)`));
    }
    console.log(formatInfo('Type "help" for commands. Use Ctrl+C to exit.\n'));

    const contextFiles = loadContextFiles();
    if (contextFiles.size > 0) {
        console.log(formatInfo(`Loaded ${contextFiles.size} context file(s) from config.`));
    }

    const state: InteractiveState = {
        options,
        conversationHistory,
        model,
        apiKey,
        contextFiles,
    };

    await runRepl(state);
}
