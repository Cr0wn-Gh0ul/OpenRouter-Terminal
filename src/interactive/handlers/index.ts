/**
 * Command Router
 * 
 * Routes user input to the appropriate command handler.
 * Returns null for inputs that should be sent to the AI.
 * 
 * @module interactive/handlers
 */
import type { CommandHandler } from '../state';

import { handleHelp, handleClear, handleUsage, handleExit } from './general';
import { handleShowModel, handleSetModel, handleModels } from './model';
import { handleShowContext, handleContextClear, handleContextAdd } from './context';
import { handleListTools, handleToolsAdd } from './tools';
import { handleListSessions, handleSave, handleLoad, handleHistory, handleBranch } from './session';
import { handleShowConfig, handleSetSystem, handleSetKey } from './config';
import { handleUndo, handleChanges } from './fileChanges';

export type { CommandHandler } from '../state';

// Returns null for inputs that should be sent to the AI
export function routeCommand(input: string): CommandHandler | null {
    const command = input.toLowerCase();
    
    // General commands
    if (command === 'help') return handleHelp;
    if (command === 'clear') return handleClear;
    if (command === 'usage') return handleUsage;
    if (command === 'exit' || command === 'quit') return handleExit;
    
    // Model commands
    if (command === 'model') return handleShowModel;
    if (command === 'models') return handleModels;
    if (command.startsWith('model ')) return handleSetModel;
    
    // Context commands
    if (command === 'context') return handleShowContext;
    if (command === 'context clear') return handleContextClear;
    if (command.startsWith('context ')) return handleContextAdd;
    
    // Tools commands
    if (command === 'tools') return handleListTools;
    if (command.startsWith('tools add ')) return handleToolsAdd;
    
    // Session commands
    if (command === 'sessions') return handleListSessions;
    if (command.startsWith('save ')) return handleSave;
    if (command.startsWith('load ')) return handleLoad;
    if (command === 'history') return handleHistory;
    if (command.startsWith('branch ')) return handleBranch;
    
    // Config commands
    if (command === 'config') return handleShowConfig;
    if (command.startsWith('system ')) return handleSetSystem;
    if (command.startsWith('key ')) return handleSetKey;
    
    // File change commands
    if (command === 'undo' || command.startsWith('undo ')) return handleUndo;
    if (command === 'changes') return handleChanges;
    
    // Not a recognized command
    return null;
}

// Re-export all handlers for direct access if needed
export {
    handleHelp,
    handleClear,
    handleUsage,
    handleExit,
    handleShowModel,
    handleSetModel,
    handleModels,
    handleShowContext,
    handleContextClear,
    handleContextAdd,
    handleListTools,
    handleToolsAdd,
    handleListSessions,
    handleSave,
    handleLoad,
    handleHistory,
    handleBranch,
    handleShowConfig,
    handleSetSystem,
    handleSetKey,
    handleUndo,
    handleChanges,
};
