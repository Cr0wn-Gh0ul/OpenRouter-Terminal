/**
 * Configuration Module - Barrel Export
 * 
 * Centralizes exports for configuration-related functionality including
 * storage operations, path utilities, and system prompt management.
 * 
 * @module config
 */
export type { Config } from './storage';
export {
    readConfig,
    writeConfig,
    updateConfig,
    getConfigPath,
    getConfigDir
} from './storage';
export { expandHome, resolvePath, displayPath } from './paths';
export { builtInSystemPrompt, buildSystemPrompt } from './systemPrompt';
