/**
 * File System Utilities for Context
 * 
 * Low-level file operations for reading and validating
 * files to be included in conversation context.
 * 
 * @module context/files
 */
import * as fs from 'fs';
import * as path from 'path';

export function readFileContents(filePath: string): string | null {
    try {
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, 'utf-8');
        }
    } catch {
        // Skip files that can't be read
    }
    return null;
}

export function isDirectory(filePath: string): boolean {
    try {
        const stat = fs.statSync(filePath);
        return stat.isDirectory();
    } catch {
        return false;
    }
}

export function resolveFilePath(filePath: string): string {
    return path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
}

export function expandGlob(pattern: string): string[] {
    // Check if pattern contains glob characters
    if (!/[*?[\]{}]/.test(pattern)) {
        return [pattern];
    }
    
    try {
        const matches = fs.globSync(pattern, { cwd: process.cwd() });
        return matches.map(m => path.resolve(process.cwd(), m));
    } catch {
        return [pattern];
    }
}
