/**
 * Session Storage
 * 
 * Handles persistence of conversation sessions to the filesystem.
 * Sessions are stored as JSON files in ~/.config/openrouter-terminal/sessions/
 * 
 * @module session/storage
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import chalk from 'chalk';
import type { Message } from '../types';
import type { Session } from './types';

const SESSIONS_DIR = path.join(os.homedir(), '.config', 'openrouter-terminal', 'sessions');

function ensureSessionsDir(): void {
    if (!fs.existsSync(SESSIONS_DIR)) {
        fs.mkdirSync(SESSIONS_DIR, { recursive: true });
    }
}

export function getSessionsDir(): string {
    return SESSIONS_DIR;
}

// Resolves a session name to its full file path
export function getSessionPath(name: string): string {
    if (path.isAbsolute(name) || name.includes('/') || name.includes('\\')) {
        return name.endsWith('.json') ? name : `${name}.json`;
    }
    return path.join(SESSIONS_DIR, `${name}.json`);
}

/**
 * Saves a session to disk.
 * Preserves the original creation timestamp if updating an existing session.
 * 
 * @param name - Session name
 * @param messages - Conversation history to save
 * @param model - Model used in the session
 * @param systemPrompt - Optional custom system prompt
 * @returns Path to the saved session file
 */
export function saveSession(
    name: string,
    messages: Message[],
    model: string,
    systemPrompt?: string
): string {
    ensureSessionsDir();
    const sessionPath = getSessionPath(name);

    let createdAt = new Date().toISOString();
    if (fs.existsSync(sessionPath)) {
        try {
            const existing = JSON.parse(fs.readFileSync(sessionPath, 'utf-8')) as Session;
            createdAt = existing.createdAt || createdAt;
        } catch {
            // Ignore parse errors, use new timestamp
        }
    }

    const session: Session = {
        name: path.basename(name, '.json'),
        model,
        systemPrompt,
        messages,
        createdAt,
        updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));
    return sessionPath;
}

export function loadSession(name: string): Session | null {
    const sessionPath = getSessionPath(name);

    if (!fs.existsSync(sessionPath)) {
        return null;
    }

    try {
        const data = fs.readFileSync(sessionPath, 'utf-8');
        return JSON.parse(data) as Session;
    } catch (error) {
        console.error(chalk.red(`Failed to load session: ${error instanceof Error ? error.message : 'Unknown error'}`));
        return null;
    }
}

export function listSessions(): string[] {
    ensureSessionsDir();
    try {
        const files = fs.readdirSync(SESSIONS_DIR);
        return files
            .filter(f => f.endsWith('.json'))
            .map(f => path.basename(f, '.json'))
            .sort();
    } catch {
        return [];
    }
}

export function deleteSession(name: string): boolean {
    const sessionPath = getSessionPath(name);
    if (fs.existsSync(sessionPath)) {
        fs.unlinkSync(sessionPath);
        return true;
    }
    return false;
}
