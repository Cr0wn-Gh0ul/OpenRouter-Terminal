/**
 * Shell Command Execution Tool
 * 
 * Provides safe shell command execution with OS-specific handling.
 * Blocks dangerous commands to prevent accidental system damage.
 * 
 * @module tools/builtins/shell
 */
import { exec } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';
import type { ToolDefinition } from '../types';

const execAsync = promisify(exec);

// Dangerous command patterns blocked on all platforms
const COMMON_BLOCKED_PATTERNS: RegExp[] = [
    /\bsudo\b/i,
    /\bsu\b/i,
    /\brm\s+(-rf?|--recursive).*\//i,
    /\brm\s+(-rf?|--recursive)\s+\*/i,
    /\bpasswd\b/i,
    /\|.*\bsh\b/i,
    /\|.*\bbash\b/i,
    /\|.*\bzsh\b/i,
    /\bcurl\b.*\|\s*(sh|bash|zsh)/i,
    /\bwget\b.*\|\s*(sh|bash|zsh)/i,
];

// Linux-specific dangerous patterns
const LINUX_BLOCKED_PATTERNS: RegExp[] = [
    /\bmkfs\b/i,
    /\bdd\b.*\bof=/i,
    /\b:>\s*\/(?!tmp)/i,
    /\bchmod\s+777\b/i,
    /\bchown\s+.*:.*\s+\//i,
    />\s*\/etc\//i,
    />\s*\/usr\//i,
    />\s*\/bin\//i,
    /\bshutdown\b/i,
    /\breboot\b/i,
    /\binit\s+[0-6]\b/i,
    /\bsystemctl\s+(stop|disable|mask)\s+(sshd|networking|systemd)/i,
    /\b(pkill|killall)\s+-9\s+(init|systemd)/i,
    /\biptables\s+-F\b/i,
    /\buseradd\b/i,
    /\buserdel\b/i,
    /\bvisudo\b/i,
];

// macOS-specific dangerous patterns
const MACOS_BLOCKED_PATTERNS: RegExp[] = [
    /\bdiskutil\s+eraseDisk\b/i,
    /\bdiskutil\s+partitionDisk\b/i,
    /\bcsrutil\b/i,
    /\bnvram\b/i,
    /\bbless\b/i,
    />\s*\/System\//i,
    />\s*\/Library\//i,
    /\blaunchctl\s+(unload|remove)\b/i,
    /\bdscl\b.*\bdelete\b/i,
    /\bsysadminctl\b/i,
    /\bfdesetup\b/i,
    /\bshutdown\b/i,
    /\breboot\b/i,
    /\bkillall\s+(Finder|Dock|SystemUIServer)/i,
];

function getBlockedPatterns(): RegExp[] {
    const platform = os.platform();
    const patterns = [...COMMON_BLOCKED_PATTERNS];
    
    if (platform === 'darwin') {
        patterns.push(...MACOS_BLOCKED_PATTERNS);
    } else {
        patterns.push(...LINUX_BLOCKED_PATTERNS);
    }
    
    return patterns;
}

function isCommandSafe(command: string): { safe: boolean; reason?: string } {
    const patterns = getBlockedPatterns();
    
    for (const pattern of patterns) {
        if (pattern.test(command)) {
            return { safe: false, reason: `Blocked pattern: ${pattern.source}` };
        }
    }
    return { safe: true };
}

function getShellConfig(): { shell: string; shellFlag: string } {
    const platform = os.platform();
    
    if (platform === 'darwin') {
        return { shell: '/bin/zsh', shellFlag: '-c' };
    }
    
    // Linux - prefer zsh if available, fallback to bash
    return { shell: '/bin/bash', shellFlag: '-c' };
}

interface _ShellArgs {
    command: string;
    cwd?: string;
    timeout?: number;
}

export const shellTool: ToolDefinition = {
    name: 'run_command',
    description: `Execute a shell command on ${os.platform() === 'darwin' ? 'macOS' : 'Linux'} and return the output. Dangerous commands (sudo, rm -rf, etc.) are blocked for safety.`,
    parameters: {
        type: 'object',
        properties: {
            command: {
                type: 'string',
                description: 'The shell command to execute (e.g., "ls -la", "df -h", "ps aux | grep node"). Note: sudo and other dangerous commands are blocked.',
            },
            cwd: {
                type: 'string',
                description: 'Working directory to run the command in. Defaults to current directory.',
            },
            timeout: {
                type: 'number',
                description: 'Timeout in milliseconds. Defaults to 30000 (30 seconds).',
            },
        },
        required: ['command'],
    },
    execute: async (args: Record<string, unknown>): Promise<string> => {
        const command = args.command as string;
        const cwd = (args.cwd as string) || process.cwd();
        const timeout = (args.timeout as number) || 30000;

        const safetyCheck = isCommandSafe(command);
        if (!safetyCheck.safe) {
            return `BLOCKED: This command was blocked for safety reasons.\n${safetyCheck.reason}\n\nIf you need to run privileged commands, do so manually in your terminal.`;
        }

        const { shell } = getShellConfig();

        try {
            const { stdout, stderr } = await execAsync(command, {
                cwd,
                timeout,
                maxBuffer: 1024 * 1024 * 10, // 10MB buffer
                shell,
            });

            let result = '';
            if (stdout) {
                result += stdout;
            }
            if (stderr) {
                result += (result ? '\n\nSTDERR:\n' : 'STDERR:\n') + stderr;
            }
            
            return result || '(command completed with no output)';
        } catch (error: any) {
            if (error.killed) {
                return `Error: Command timed out after ${timeout}ms`;
            }
            if (error.code) {
                return `Error (exit code ${error.code}): ${error.stderr || error.message}`;
            }
            return `Error: ${error.message}`;
        }
    },
};
