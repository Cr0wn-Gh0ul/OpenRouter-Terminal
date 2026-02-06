/**
 * System Info Tool
 * 
 * Built-in tool for retrieving operating system and environment information.
 * 
 * @module tools/builtins/systemInfo
 */
import * as os from 'os';
import type { ToolDefinition } from '../types';
import { formatSize } from './utils';

export const systemInfoTool: ToolDefinition = {
    name: 'system_info',
    description: 'Get detailed information about the operating system, hardware, and runtime environment.',
    parameters: {
        type: 'object',
        properties: {},
        required: [],
    },
    execute: async () => {
        const cpus = os.cpus();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const uptime = os.uptime();
        
        const formatUptime = (seconds: number): string => {
            const days = Math.floor(seconds / 86400);
            const hours = Math.floor((seconds % 86400) / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            const parts: string[] = [];
            if (days > 0) parts.push(`${days}d`);
            if (hours > 0) parts.push(`${hours}h`);
            if (mins > 0) parts.push(`${mins}m`);
            return parts.join(' ') || '< 1m';
        };

        const info = {
            os: {
                platform: os.platform(),
                type: os.type(),
                release: os.release(),
                version: os.version(),
                arch: os.arch(),
                hostname: os.hostname(),
                uptime: formatUptime(uptime),
            },
            cpu: {
                model: cpus[0]?.model || 'Unknown',
                cores: cpus.length,
                speed: `${cpus[0]?.speed || 0} MHz`,
            },
            memory: {
                total: formatSize(totalMem),
                used: formatSize(usedMem),
                free: formatSize(freeMem),
                usagePercent: `${((usedMem / totalMem) * 100).toFixed(1)}%`,
            },
            user: {
                username: os.userInfo().username,
                homeDir: os.homedir(),
                shell: os.userInfo().shell || 'Unknown',
            },
            runtime: {
                nodeVersion: process.version,
                pid: process.pid,
                cwd: process.cwd(),
            },
            network: {
                interfaces: Object.keys(os.networkInterfaces()),
            },
        };

        return JSON.stringify(info, null, 2);
    },
};
