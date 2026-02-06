/**
 * Path Utilities
 * 
 * Helper functions for path manipulation, including home directory
 * expansion and display-friendly path formatting.
 * 
 * @module config/paths
 */
import * as path from 'path';
import * as os from 'os';

// Expands ~ prefix to user's home directory
export function expandHome(targetPath: string): string {
    if (targetPath.startsWith('~')) {
        return path.join(os.homedir(), targetPath.slice(1));
    }
    return targetPath;
}

export function resolvePath(targetPath: string): string {
    return path.resolve(expandHome(targetPath));
}

// Converts absolute path to display-friendly format with ~
export function displayPath(targetPath: string): string {
    const home = os.homedir();
    if (targetPath.startsWith(home)) {
        return '~' + targetPath.slice(home.length);
    }
    return targetPath;
}
