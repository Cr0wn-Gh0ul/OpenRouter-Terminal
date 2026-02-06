/**
 * Built-in Tools - Barrel Export
 * 
 * Aggregates and exports all built-in tool definitions.
 * 
 * @module tools/builtins
 */
import type { ToolDefinition } from '../types';

export { listFilesTool } from './listFiles';
export { readFileTool } from './readFile';
export { writeFileTool } from './writeFile';
export { editFileTool } from './editFile';
export { undoChangeTool, listChangesTool } from './undoChange';
export { searchCodeTool } from './searchCode';
export { getWorkingDirectoryTool } from './getCwd';
export { fileInfoTool } from './fileInfo';
export { systemInfoTool } from './systemInfo';
export { shellTool } from './shell';
export { fileHistory } from './fileHistory';

export { formatSize, resolvePath } from './utils';

import { listFilesTool } from './listFiles';
import { readFileTool } from './readFile';
import { writeFileTool } from './writeFile';
import { editFileTool } from './editFile';
import { undoChangeTool, listChangesTool } from './undoChange';
import { searchCodeTool } from './searchCode';
import { getWorkingDirectoryTool } from './getCwd';
import { fileInfoTool } from './fileInfo';
import { systemInfoTool } from './systemInfo';
import { shellTool } from './shell';

export const builtInTools: ToolDefinition[] = [
    listFilesTool,
    readFileTool,
    writeFileTool,
    editFileTool,
    undoChangeTool,
    listChangesTool,
    searchCodeTool,
    getWorkingDirectoryTool,
    fileInfoTool,
    systemInfoTool,
    shellTool,
];
