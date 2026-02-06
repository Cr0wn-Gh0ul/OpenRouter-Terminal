/**
 * CLI Module - Barrel Export
 * 
 * Centralizes exports for CLI program setup and flag handling.
 * 
 * @module cli
 */
export { createProgram, parseArgs } from './program';
export {
    processEarlyFlags,
    processConfigFlags,
    handleConfigFlag,
    handleToolsFlag,
    handleSessionsFlag,
    handleContextFlag
} from './commands';
