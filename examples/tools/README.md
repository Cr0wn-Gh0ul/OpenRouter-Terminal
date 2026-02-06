# OpenRouter Terminal Tools

This directory contains example tools that can be used with OpenRouter Terminal.

## What are Tools?

Tools are functions that the AI model can call during a conversation. They extend the AI's capabilities by allowing it to perform actions like calculations, fetching data, or interacting with external services.

## How to Use Tools

### Option 1: Add via Config File

Edit `~/.config/openrouter-terminal/config.json`:

```json
{
  "apiKey": "your-api-key",
  "model": "anthropic/claude-sonnet-4",
  "toolPaths": [
    "/path/to/your/tools",
    "/path/to/specific/tool.js"
  ]
}
```

### Option 2: Add via Interactive Mode

In interactive mode, use the `tools add` command:

```
> tools add /path/to/tools/directory
Added tool path: /path/to/tools/directory
Loaded 3 new tool(s). Total: 3 custom tools.

> tools add /path/to/specific/tool.js
Added tool path: /path/to/specific/tool.js
Loaded 1 new tool(s). Total: 4 custom tools.
```

The path will be saved to your config and tools will be available immediately.

### Verify Tools are Loaded

```bash
openrouter -t
```

Or in interactive mode, type `tools`.

3. **Use them in conversation:**

   The AI will automatically use tools when appropriate. For example:
   - "What time is it in Tokyo?"
   - "Calculate 15% of 847"

## Creating Your Own Tools

Tools are JavaScript modules that export a specific interface:

```javascript
module.exports = {
    // Required: Unique name for the tool
    name: 'my_tool',
    
    // Required: Description for the AI to understand when to use it
    description: 'What this tool does',
    
    // Required: JSON Schema for parameters
    parameters: {
        type: 'object',
        properties: {
            param1: {
                type: 'string',
                description: 'Description of param1',
            },
            param2: {
                type: 'number',
                description: 'Description of param2',
            },
        },
        required: ['param1'],  // Optional: list required params
    },
    
    // Required: Async function that executes the tool
    execute: async (args) => {
        const { param1, param2 } = args;
        // Do something...
        return 'Result as a string';
    },
};
```

## Example Tools

- **get_time.js** - Get current date/time in various formats and timezones
- **calculator.js** - Perform basic arithmetic calculations

## Tips

- Tool names should be descriptive and use snake_case
- Descriptions should be clear so the AI knows when to use the tool
- Return values must be strings
- Handle errors gracefully and return error messages as strings
- Tools can be async and call external APIs
