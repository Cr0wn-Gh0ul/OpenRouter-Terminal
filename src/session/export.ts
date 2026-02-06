/**
 * Session Export
 * 
 * Converts sessions to alternative formats for sharing or archiving.
 * 
 * @module session/export
 */
import * as fs from 'fs';
import type { Session } from './types';
import { getSessionPath } from './storage';

export function exportSessionToMarkdown(session: Session): string {
    const lines: string[] = [];
    lines.push(`# Session: ${session.name}`);
    lines.push(`Model: ${session.model}`);
    lines.push(`Created: ${session.createdAt}`);
    lines.push(`Updated: ${session.updatedAt}`);
    lines.push('');
    lines.push('---');
    lines.push('');

    for (const msg of session.messages) {
        if (msg.role === 'system') {
            lines.push('## System Prompt');
            lines.push('');
            lines.push(msg.content || '');
            lines.push('');
        } else if (msg.role === 'user') {
            lines.push('## User');
            lines.push('');
            lines.push(msg.content || '');
            lines.push('');
        } else if (msg.role === 'assistant') {
            lines.push('## Assistant');
            lines.push('');
            lines.push(msg.content || '');
            lines.push('');
        } else if (msg.role === 'tool') {
            lines.push('## Tool Result');
            lines.push('');
            lines.push('```json');
            lines.push(msg.content || '');
            lines.push('```');
            lines.push('');
        }
    }

    return lines.join('\n');
}

export function saveSessionAsMarkdown(name: string, session: Session): string {
    const mdPath = getSessionPath(name).replace(/\.json$/, '.md');
    const markdown = exportSessionToMarkdown(session);
    fs.writeFileSync(mdPath, markdown);
    return mdPath;
}
