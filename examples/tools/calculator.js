// Example tool: Simple calculator
// Performs basic arithmetic operations

module.exports = {
    name: 'calculator',
    description: 'Perform basic arithmetic calculations',
    parameters: {
        type: 'object',
        properties: {
            operation: {
                type: 'string',
                description: 'The operation to perform',
                enum: ['add', 'subtract', 'multiply', 'divide', 'power', 'sqrt'],
            },
            a: {
                type: 'number',
                description: 'First number',
            },
            b: {
                type: 'number',
                description: 'Second number (not needed for sqrt)',
            },
        },
        required: ['operation', 'a'],
    },
    execute: async (args) => {
        const { operation, a, b } = args;
        
        switch (operation) {
            case 'add':
                return String(a + b);
            case 'subtract':
                return String(a - b);
            case 'multiply':
                return String(a * b);
            case 'divide':
                if (b === 0) return 'Error: Division by zero';
                return String(a / b);
            case 'power':
                return String(Math.pow(a, b));
            case 'sqrt':
                if (a < 0) return 'Error: Cannot calculate square root of negative number';
                return String(Math.sqrt(a));
            default:
                return `Error: Unknown operation "${operation}"`;
        }
    },
};
