/**
 * Configuration Storage
 * 
 * Handles persistent storage of user configuration in the filesystem.
 * Configuration is stored as JSON in ~/.config/openrouter-terminal/config.json
 * 
 * @module config/storage
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// All fields are optional with sensible defaults applied at runtime
export interface Config {
    apiKey?: string;
    model?: string;
    systemPrompt?: string;
    toolPaths?: string[];
    contextPaths?: string[];
    maxIterations?: number;
}

const CONFIG_DIR = path.join(os.homedir(), '.config', 'openrouter-terminal');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export function getConfigDir(): string {
    return CONFIG_DIR;
}

export function getConfigPath(): string {
    return CONFIG_FILE;
}

// Returns empty config if file doesn't exist or is invalid
export function readConfig(): Config {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
            return JSON.parse(data) as Config;
        }
    } catch {
        // Return empty config if file doesn't exist or is invalid
    }
    return {};
}

// Creates the config directory if it does not exist
export function writeConfig(config: Config): void {
    try {
        if (!fs.existsSync(CONFIG_DIR)) {
            fs.mkdirSync(CONFIG_DIR, { recursive: true });
        }
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    } catch (error) {
        throw new Error(`Failed to write config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Merges partial updates into the existing configuration
export function updateConfig(updates: Partial<Config>): void {
    const current = readConfig();
    writeConfig({ ...current, ...updates });
}
