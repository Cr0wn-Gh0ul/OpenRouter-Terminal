/**
 * General Command Handlers
 * 
 * Handlers for basic commands: help, clear, usage, exit.
 * 
 * @module interactive/handlers/general
 */
import type { InteractiveState, HandlerResult } from '../state';
import { displaySessionUsage, resetSessionUsage } from '../../usage';
import { buildSystemPrompt } from '../../config';
import { colors, formatHeader } from '../../ui';

export async function handleHelp(_input: string, _state: InteractiveState): Promise<HandlerResult> {
    console.log(colors.primary('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(colors.header('  Commands'));
    console.log(colors.primary('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
    
    console.log(colors.header('  General'));
    console.log(colors.muted('  ─────────────────────────────────────────────'));
    console.log(colors.command('  help                ') + colors.description('Show this help message'));
    console.log(colors.command('  clear               ') + colors.description('Clear conversation history'));
    console.log(colors.command('  usage               ') + colors.description('Show token/cost usage for session'));
    console.log(colors.command('  exit, quit          ') + colors.description('Exit the chat'));
    console.log();

    console.log(colors.header('  Model'));
    console.log(colors.muted('  ─────────────────────────────────────────────'));
    console.log(colors.command('  model               ') + colors.description('Show current model'));
    console.log(colors.command('  model <name>        ') + colors.description('Switch to a different model'));
    console.log(colors.command('  models              ') + colors.description('Browse and select from available models'));
    console.log();

    console.log(colors.header('  Context'));
    console.log(colors.muted('  ─────────────────────────────────────────────'));
    console.log(colors.command('  context             ') + colors.description('Show files in context'));
    console.log(colors.command('  context <file...>   ') + colors.description('Add file(s) to message context'));
    console.log(colors.command('  context clear       ') + colors.description('Clear all context files'));
    console.log();

    console.log(colors.header('  Tools'));
    console.log(colors.muted('  ─────────────────────────────────────────────'));
    console.log(colors.command('  tools               ') + colors.description('List registered tools'));
    console.log(colors.command('  tools add <path>    ') + colors.description('Add a tool file or directory'));
    console.log();

    console.log(colors.header('  Sessions'));
    console.log(colors.muted('  ─────────────────────────────────────────────'));
    console.log(colors.command('  sessions            ') + colors.description('List all saved sessions'));
    console.log(colors.command('  save <name>         ') + colors.description('Save conversation to a session file'));
    console.log(colors.command('  save <name> md      ') + colors.description('Save as Markdown file'));
    console.log(colors.command('  load <name>         ') + colors.description('Load a saved session'));
    console.log(colors.command('  history             ') + colors.description('Show conversation history'));
    console.log(colors.command('  branch <n>          ') + colors.description('Rewind to message N (for branching)'));
    console.log();

    console.log(colors.header('  Configuration'));
    console.log(colors.muted('  ─────────────────────────────────────────────'));
    console.log(colors.command('  config              ') + colors.description('Show current configuration'));
    console.log(colors.command('  system <prompt>     ') + colors.description('Set a new system prompt'));
    console.log(colors.command('  key <apikey>        ') + colors.description('Set and save API key'));
    console.log();

    console.log(colors.header('  File Changes'));
    console.log(colors.muted('  ─────────────────────────────────────────────'));
    console.log(colors.command('  undo                ') + colors.description('Undo the last file change'));
    console.log(colors.command('  undo <id>           ') + colors.description('Undo a specific change by ID'));
    console.log(colors.command('  changes             ') + colors.description('List recent file changes'));
    console.log();
    
    return { continue: true };
}

export async function handleClear(_input: string, state: InteractiveState): Promise<HandlerResult> {
    state.conversationHistory.length = 0;
    state.conversationHistory.push({ 
        role: 'system', 
        content: buildSystemPrompt(state.options.system) 
    });
    resetSessionUsage();
    console.log(colors.secondary('Conversation history cleared.\n'));
    return { continue: true };
}

export async function handleUsage(_input: string, _state: InteractiveState): Promise<HandlerResult> {
    displaySessionUsage();
    return { continue: true };
}

export async function handleExit(_input: string, _state: InteractiveState): Promise<HandlerResult> {
    displaySessionUsage();
    console.log(colors.primary('Goodbye!'));
    return { continue: false };
}
