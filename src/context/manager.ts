/**
 * Context Management
 * 
 * Manages file context that is prepended to user messages.
 * Context files provide the AI with additional information
 * about the user's codebase or working environment.
 * 
 * @module context/manager
 */
import { readConfig, updateConfig } from '../config';
import { readFileContents, isDirectory, resolveFilePath } from './files';

export function loadContextFiles(): Map<string, string> {
    const contextFiles: Map<string, string> = new Map();
    const savedContextPaths = readConfig().contextPaths || [];

    for (const filePath of savedContextPaths) {
        const content = readFileContents(filePath);
        if (content !== null) {
            contextFiles.set(filePath, content);
        }
    }
    return contextFiles;
}

// Context is formatted as XML-like file blocks
export function buildMessageWithContext(message: string, contextFiles: Map<string, string>): string {
    if (contextFiles.size === 0) {
        return message;
    }
    const contextParts: string[] = [];
    for (const [filePath, content] of contextFiles) {
        contextParts.push(`<file path="${filePath}">\n${content}\n</file>`);
    }
    return contextParts.join('\n\n') + '\n\n' + message;
}

export function addFileToContext(
    filePath: string,
    contextFiles: Map<string, string>
): { success: boolean; error?: string } {
    const absolutePath = resolveFilePath(filePath);

    if (isDirectory(absolutePath)) {
        return { success: false, error: 'directory' };
    }

    const content = readFileContents(absolutePath);
    if (content === null) {
        return { success: false, error: 'read' };
    }

    contextFiles.set(absolutePath, content);
    return { success: true };
}

export function saveContextToConfig(contextFiles: Map<string, string>): void {
    updateConfig({ contextPaths: Array.from(contextFiles.keys()) });
}

export function clearContext(contextFiles: Map<string, string>): void {
    contextFiles.clear();
    updateConfig({ contextPaths: [] });
}
