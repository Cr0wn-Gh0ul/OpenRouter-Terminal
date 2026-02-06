/**
 * Interactive Mode State Types
 * 
 * Defines the shared state and handler types used throughout
 * the interactive REPL session.
 * 
 * @module interactive/state
 */
import * as readline from 'readline';
import type { Message, CLIOptions } from '../types';

export interface InteractiveState {
    options: CLIOptions;
    conversationHistory: Message[];
    model: string;
    apiKey: string;
    contextFiles: Map<string, string>;
    abortController: AbortController | null;
    maxIterations: number;
    rl: readline.Interface | null;
}

export interface HandlerResult {
    continue: boolean;
    restart?: boolean;
}

export type CommandHandler = (
    input: string,
    state: InteractiveState
) => Promise<HandlerResult>;
