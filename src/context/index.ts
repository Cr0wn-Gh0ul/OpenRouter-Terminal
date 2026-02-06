/**
 * Context Module - Barrel Export
 * 
 * Centralizes exports for context management functionality.
 * Context files are included with messages to provide the AI
 * with relevant file contents.
 * 
 * @module context
 */
export {
    loadContextFiles,
    buildMessageWithContext,
    addFileToContext,
    saveContextToConfig,
    clearContext
} from './manager';
export { readFileContents, isDirectory, resolveFilePath, expandGlob } from './files';
