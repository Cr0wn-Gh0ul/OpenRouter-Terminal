/**
 * Session Command Handlers
 * 
 * Handlers for session management: listing, saving, loading,
 * viewing history, and branching conversations.
 * 
 * @module interactive/handlers/session
 */
import type { InteractiveState, HandlerResult } from '../state';
import {
    saveSession,
    loadSession,
    listSessions,
    saveSessionAsMarkdown,
    showHistory,
    branchAtMessage,
    getSessionsDir
} from '../../session';
import { colors, formatInfo, formatSuccess, formatError, formatMuted } from '../../ui';

export async function handleListSessions(_input: string, _state: InteractiveState): Promise<HandlerResult> {
    const sessions = listSessions();
    if (sessions.length === 0) {
        console.log(formatInfo('No saved sessions found.'));
        console.log(formatMuted(`Sessions directory: ${getSessionsDir()}`));
    } else {
        console.log(colors.primary('Saved sessions:'));
        sessions.forEach(s => console.log(colors.secondary(`  ${s}`)));
    }
    console.log();
    return { continue: true };
}

export async function handleSave(input: string, state: InteractiveState): Promise<HandlerResult> {
    const args = input.slice(5).trim().split(/\s+/);
    const sessionName = args[0];
    const format = args[1]?.toLowerCase();
    
    if (!sessionName) {
        console.log(formatError('Please provide a session name.'));
        console.log(formatInfo('Usage: save <name> [md]\n'));
        return { continue: true };
    }

    const systemMsg = state.conversationHistory.find(m => m.role === 'system');
    const userSystemPrompt = systemMsg?.content || '';
    
    if (format === 'md' || format === 'markdown') {
        const session = {
            name: sessionName,
            model: state.options.model!,
            systemPrompt: userSystemPrompt,
            messages: state.conversationHistory,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const mdPath = saveSessionAsMarkdown(sessionName, session);
        console.log(formatSuccess(`Session saved as Markdown: ${mdPath}\n`));
    } else {
        const savedPath = saveSession(sessionName, state.conversationHistory, state.options.model!, userSystemPrompt);
        console.log(formatSuccess(`Session saved: ${savedPath}\n`));
    }
    return { continue: true };
}

export async function handleLoad(input: string, state: InteractiveState): Promise<HandlerResult> {
    const sessionName = input.slice(5).trim();
    if (!sessionName) {
        console.log(formatError('Please provide a session name.'));
        console.log(formatInfo('Usage: load <name>\n'));
        return { continue: true };
    }

    const session = loadSession(sessionName);
    if (!session) {
        console.log(formatError(`Session not found: ${sessionName}`));
        console.log(formatInfo('Use "sessions" to list available sessions.\n'));
        return { continue: true };
    }

    state.conversationHistory.length = 0;
    state.conversationHistory.push(...session.messages);
    
    if (session.model) {
        state.options.model = session.model;
        state.model = session.model;
    }

    console.log(formatSuccess(`Loaded session: ${session.name}`));
    console.log(formatInfo(`  Model: ${session.model}`));
    console.log(formatInfo(`  Messages: ${session.messages.length}`));
    console.log(formatInfo(`  Updated: ${session.updatedAt}\n`));
    return { continue: true };
}

export async function handleHistory(_input: string, state: InteractiveState): Promise<HandlerResult> {
    showHistory(state.conversationHistory);
    return { continue: true };
}

export async function handleBranch(input: string, state: InteractiveState): Promise<HandlerResult> {
    const indexStr = input.slice(7).trim();
    const index = parseInt(indexStr, 10);
    
    if (isNaN(index)) {
        console.log(formatError('Please provide a valid message number.'));
        console.log(formatInfo('Usage: branch <n>\n'));
        return { continue: true };
    }

    if (branchAtMessage(state.conversationHistory, index)) {
        console.log(formatSuccess(`Rewound to message ${index}. Conversation branched.`));
        console.log(formatInfo(`Now have ${state.conversationHistory.length} messages.\n`));
    } else {
        console.log(formatError(`Invalid message number: ${index}`));
        console.log(formatInfo(`Valid range: 0 to ${state.conversationHistory.length - 1}\n`));
    }
    return { continue: true };
}
