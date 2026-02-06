/**
 * Search Code Tool
 * 
 * Search for patterns across files in the codebase.
 * 
 * @module tools/builtins/searchCode
 */
import * as fs from 'fs';
import * as path from 'path';
import type { ToolDefinition } from '../types';
import { resolvePath } from './utils';

interface SearchMatch {
    file: string;
    line: number;
    content: string;
}

/**
 * Default patterns to ignore when searching
 */
const DEFAULT_IGNORE = [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
    'coverage',
    '__pycache__',
    '.venv',
    'venv',
    '.DS_Store',
    '*.min.js',
    '*.min.css',
    '*.map',
    '*.lock',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
];

/**
 * Check if a path should be ignored
 */
function shouldIgnore(filePath: string, ignorePatterns: string[]): boolean {
    const parts = filePath.split(path.sep);
    
    for (const pattern of ignorePatterns) {
        // Directory or exact match
        if (parts.includes(pattern)) return true;
        
        // Glob pattern for extension
        if (pattern.startsWith('*.')) {
            const ext = pattern.slice(1);
            if (filePath.endsWith(ext)) return true;
        }
    }
    
    return false;
}

/**
 * Recursively find all files in a directory
 */
function findFiles(dir: string, ignorePatterns: string[], maxDepth: number = 10, depth: number = 0): string[] {
    if (depth > maxDepth) return [];
    
    const files: string[] = [];
    
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (shouldIgnore(fullPath, ignorePatterns)) continue;
            
            if (entry.isDirectory()) {
                files.push(...findFiles(fullPath, ignorePatterns, maxDepth, depth + 1));
            } else if (entry.isFile()) {
                files.push(fullPath);
            }
        }
    } catch {
        // Ignore permission errors etc
    }
    
    return files;
}

/**
 * Check if a file is likely binary
 */
function isBinaryFile(filePath: string): boolean {
    const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.zip', '.tar', '.gz', '.exe', '.dll', '.so', '.dylib', '.woff', '.woff2', '.ttf', '.eot'];
    const ext = path.extname(filePath).toLowerCase();
    return binaryExtensions.includes(ext);
}

/**
 * Search a file for a pattern
 */
function searchFile(filePath: string, pattern: RegExp, contextLines: number): SearchMatch[] {
    const matches: SearchMatch[] = [];
    
    try {
        if (isBinaryFile(filePath)) return matches;
        
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            if (pattern.test(lines[i])) {
                // Get context lines
                const start = Math.max(0, i - contextLines);
                const end = Math.min(lines.length - 1, i + contextLines);
                const context = lines.slice(start, end + 1).map((line, idx) => {
                    const lineNum = start + idx + 1;
                    const marker = lineNum === i + 1 ? '>' : ' ';
                    return `${marker} ${lineNum}: ${line}`;
                }).join('\n');
                
                matches.push({
                    file: filePath,
                    line: i + 1,
                    content: context,
                });
            }
        }
    } catch {
        // Ignore read errors
    }
    
    return matches;
}

export const searchCodeTool: ToolDefinition = {
    name: 'search_code',
    description: 'Search for a pattern across files in the codebase. Supports regex patterns. Returns matching lines with context.',
    parameters: {
        type: 'object',
        properties: {
            pattern: {
                type: 'string',
                description: 'The pattern to search for. Supports regex.',
            },
            path: {
                type: 'string',
                description: 'Directory to search in. Default: current directory.',
            },
            filePattern: {
                type: 'string',
                description: 'Only search files matching this glob pattern (e.g., "*.ts", "*.py"). Default: all files.',
            },
            caseSensitive: {
                type: 'boolean',
                description: 'Whether the search is case-sensitive. Default: false',
            },
            contextLines: {
                type: 'number',
                description: 'Number of context lines to show around each match. Default: 2',
            },
            maxResults: {
                type: 'number',
                description: 'Maximum number of results to return. Default: 50',
            },
        },
        required: ['pattern'],
    },
    execute: async (args) => {
        try {
            const pattern = args.pattern as string;
            const searchDir = resolvePath((args.path as string) || '.');
            const caseSensitive = (args.caseSensitive as boolean) ?? false;
            const contextLines = (args.contextLines as number) ?? 2;
            const maxResults = (args.maxResults as number) ?? 50;
            const filePattern = args.filePattern as string | undefined;
            
            // Check directory exists
            if (!fs.existsSync(searchDir)) {
                return `Error: Directory not found: ${searchDir}`;
            }

            // Create regex pattern
            let regex: RegExp;
            try {
                regex = new RegExp(pattern, caseSensitive ? 'g' : 'gi');
            } catch (e) {
                return `Error: Invalid regex pattern: ${pattern}`;
            }

            // Find all files
            const files = findFiles(searchDir, DEFAULT_IGNORE);
            
            // Filter by file pattern if specified
            let filteredFiles = files;
            if (filePattern) {
                const ext = filePattern.startsWith('*.') 
                    ? filePattern.slice(1) 
                    : filePattern;
                filteredFiles = files.filter(f => f.endsWith(ext));
            }

            // Search files
            const allMatches: SearchMatch[] = [];
            
            for (const file of filteredFiles) {
                if (allMatches.length >= maxResults) break;
                
                const matches = searchFile(file, regex, contextLines);
                allMatches.push(...matches);
            }

            if (allMatches.length === 0) {
                return `No matches found for: ${pattern}\n` +
                       `Searched ${filteredFiles.length} files in ${searchDir}`;
            }

            // Format results
            const limited = allMatches.slice(0, maxResults);
            const results = limited.map(m => {
                const relPath = path.relative(searchDir, m.file);
                return `${relPath}:${m.line}\n${m.content}`;
            }).join('\n\n---\n\n');

            const summary = allMatches.length > maxResults
                ? `Found ${allMatches.length} matches (showing first ${maxResults})`
                : `Found ${allMatches.length} match${allMatches.length === 1 ? '' : 'es'}`;

            return `${summary} in ${filteredFiles.length} files:\n\n${results}`;

        } catch (error) {
            return `Error searching: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    },
};
