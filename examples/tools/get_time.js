// Example tool: Get current date and time
// Save this file and add its path to your config's toolPaths array

module.exports = {
    name: 'get_current_time',
    description: 'Get the current date and time in the specified timezone',
    parameters: {
        type: 'object',
        properties: {
            timezone: {
                type: 'string',
                description: 'The timezone (e.g., "America/New_York", "UTC", "Europe/London")',
            },
            format: {
                type: 'string',
                description: 'Output format: "iso", "readable", or "unix"',
                enum: ['iso', 'readable', 'unix'],
            },
        },
        required: [],
    },
    execute: async (args) => {
        const timezone = args.timezone || 'UTC';
        const format = args.format || 'readable';
        
        try {
            const now = new Date();
            
            switch (format) {
                case 'unix':
                    return String(Math.floor(now.getTime() / 1000));
                case 'iso':
                    return now.toISOString();
                case 'readable':
                default:
                    return now.toLocaleString('en-US', { timeZone: timezone });
            }
        } catch (error) {
            return `Error: ${error.message}`;
        }
    },
};
