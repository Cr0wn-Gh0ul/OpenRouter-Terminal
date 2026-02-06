/**
 * Built-in Tool Utilities
 * 
 * Shared utility functions used by built-in tools.
 * 
 * @module tools/builtins/utils
 */

/**
 * Formats a byte count into a human-readable string.
 * 
 * @param bytes - Number of bytes to format
 * @returns Formatted size string (e.g., "1.5 MB")
 */
export function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Expands tilde to home directory and resolves to absolute path.
 * 
 * @param targetPath - Path to resolve (may contain ~)
 * @returns Absolute filesystem path
 */
export function resolvePath(targetPath: string): string {
    const path = require('path');
    const os = require('os');

    if (targetPath.startsWith('~')) {
        targetPath = path.join(os.homedir(), targetPath.slice(1));
    }

    return path.resolve(targetPath);
}
