/**
 * Tool Loader and Registry
 * 
 * Manages loading, registration, and execution of tools.
 * Supports both built-in tools and dynamically loaded custom tools.
 * 
 * @module tools/loader
 */
import * as fs from 'fs';
import * as path from 'path';
import type { ToolDefinition, OpenRouterTool } from './types';
import { toOpenRouterTool } from './types';
import { builtInTools } from './builtins';
import { colors, formatError, formatInfo } from '../ui';

const toolRegistry = new Map<string, ToolDefinition>();
const builtInToolNames = new Set<string>();

// Registers all built-in tools in the registry
export function registerBuiltInTools(): void {
    for (const tool of builtInTools) {
        toolRegistry.set(tool.name, tool);
        builtInToolNames.add(tool.name);
    }
}

registerBuiltInTools();

// Loads a tool definition from a JavaScript file
export async function loadToolFromFile(filePath: string): Promise<ToolDefinition | null> {
    try {
        const absolutePath = path.resolve(filePath);

        if (!fs.existsSync(absolutePath)) {
            console.error(formatError(`Tool file not found: ${absolutePath}`));
            return null;
        }

        const module = await import(absolutePath);
        const tool: ToolDefinition = module.default || module.tool || module;

        if (!tool.name || !tool.description || !tool.parameters || !tool.execute) {
            console.error(formatError(`Invalid tool format in: ${filePath}`));
            console.error(formatInfo('Tools must export: name, description, parameters, execute'));
            return null;
        }

        return tool;
    } catch (error) {
        console.error(formatError(`Failed to load tool from ${filePath}:`), error);
        return null;
    }
}

// Loads all valid tools from a directory
export async function loadToolsFromDirectory(dirPath: string): Promise<ToolDefinition[]> {
    const tools: ToolDefinition[] = [];
    const absolutePath = path.resolve(dirPath);

    if (!fs.existsSync(absolutePath)) {
        console.error(formatError(`Tool directory not found: ${absolutePath}`));
        return tools;
    }

    const files = fs.readdirSync(absolutePath);

    for (const file of files) {
        if (file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.cjs')) {
            const tool = await loadToolFromFile(path.join(absolutePath, file));
            if (tool) {
                tools.push(tool);
            }
        }
    }

    return tools;
}

// Loads tools from an array of paths (files or directories)
export async function loadToolsFromPaths(paths: string[]): Promise<void> {
    for (const toolPath of paths) {
        const absolutePath = path.resolve(toolPath);

        if (!fs.existsSync(absolutePath)) {
            console.warn(formatInfo(`Tool path not found: ${toolPath}`));
            continue;
        }

        const stat = fs.statSync(absolutePath);

        if (stat.isDirectory()) {
            const tools = await loadToolsFromDirectory(absolutePath);
            for (const tool of tools) {
                registerTool(tool);
            }
        } else if (stat.isFile()) {
            const tool = await loadToolFromFile(absolutePath);
            if (tool) {
                registerTool(tool);
            }
        }
    }
}

export function registerTool(tool: ToolDefinition): void {
    if (toolRegistry.has(tool.name)) {
        console.warn(formatInfo(`Tool "${tool.name}" already registered, overwriting...`));
    }
    toolRegistry.set(tool.name, tool);
}

export function getRegisteredTools(): ToolDefinition[] {
    return Array.from(toolRegistry.values());
}

export function getCustomTools(): ToolDefinition[] {
    return Array.from(toolRegistry.values()).filter(t => !builtInToolNames.has(t.name));
}

export function getOpenRouterTools(): OpenRouterTool[] {
    return getRegisteredTools().map(toOpenRouterTool);
}

export function getTool(name: string): ToolDefinition | undefined {
    return toolRegistry.get(name);
}

// Executes a tool by name. Throws if tool is not found.
export async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
    const tool = toolRegistry.get(name);

    if (!tool) {
        throw new Error(`Tool not found: ${name}`);
    }

    return await tool.execute(args);
}

export function clearTools(): void {
    toolRegistry.clear();
}

export function listTools(): void {
    const tools = getRegisteredTools().filter(t => !builtInToolNames.has(t.name));

    if (tools.length === 0) {
        console.log(formatInfo('No custom tools registered.'));
        return;
    }

    console.log(colors.primary(`\nRegistered tools (${tools.length}):`));
    for (const tool of tools) {
        console.log(colors.secondary(`  ${tool.name}: ${tool.description}`));
    }
    console.log();
}
