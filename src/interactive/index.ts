/**
 * Interactive Module - Barrel Export
 * 
 * Centralizes exports for the interactive REPL mode.
 * 
 * @module interactive
 */
export { interactiveMode, runRepl } from './repl';
export type { InteractiveState, HandlerResult, CommandHandler } from './state';
export { routeCommand } from './handlers';
