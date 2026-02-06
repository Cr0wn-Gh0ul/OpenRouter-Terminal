```
 ██████╗ ██████╗ ███████╗███╗   ██╗██████╗  ██████╗ ██╗   ██╗████████╗███████╗██████╗ 
██╔═══██╗██╔══██╗██╔════╝████╗  ██║██╔══██╗██╔═══██╗██║   ██║╚══██╔══╝██╔════╝██╔══██╗
██║   ██║██████╔╝█████╗  ██╔██╗ ██║██████╔╝██║   ██║██║   ██║   ██║   █████╗  ██████╔╝
██║   ██║██╔═══╝ ██╔══╝  ██║╚██╗██║██╔══██╗██║   ██║██║   ██║   ██║   ██╔══╝  ██╔══██╗
╚██████╔╝██║     ███████╗██║ ╚████║██║  ██║╚██████╔╝╚██████╔╝   ██║   ███████╗██║  ██║
 ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝    ╚═╝   ╚══════╝╚═╝  ╚═╝
                                                                                      
████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗                          
╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗██║                          
   ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██║                          
   ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║                          
   ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗                     
   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝                     
```

An AI-powered terminal assistant that can edit files, search codebases, and run shell commands. Use any model on [OpenRouter](https://openrouter.ai) with full undo support and cost tracking.

## Features

- **Streaming Responses** - Real-time token streaming for instant feedback
- **Tool/Function Calling** - Extend AI capabilities with custom JavaScript tools
- **File Editing with Undo** - AI can read, write, and edit files with diff preview and full rollback
- **File Change Tracking** - All modifications are recorded with `changes` and `undo` commands
- **Codebase Search** - Search across your project with regex support
- **Context Management** - Attach files to provide persistent context to the AI
- **Session Management** - Save, load, and branch conversations
- **Token and Cost Tracking** - Monitor usage and spending per message and session
- **Model Browser** - Browse and select from hundreds of available models
- **Persistent Config** - Settings saved to `~/.config/openrouter-terminal/`

## Installation

### From npm

```bash
npm install -g openrouter-terminal
```

### From GitHub Releases

Download the pre-built binary for your platform from the [Releases](https://github.com/Cr0wn-Gh0ul/OpenRouter-Terminal/releases) page.

**Linux (x64):**
```bash
curl -L https://github.com/Cr0wn-Gh0ul/OpenRouter-Terminal/releases/latest/download/openrouter-linux-x64 -o openrouter
chmod +x openrouter
sudo mv openrouter /usr/local/bin/
```

**Linux (ARM64):**
```bash
curl -L https://github.com/Cr0wn-Gh0ul/OpenRouter-Terminal/releases/latest/download/openrouter-linux-arm64 -o openrouter
chmod +x openrouter
sudo mv openrouter /usr/local/bin/
```

**macOS (Apple Silicon):**
```bash
curl -L https://github.com/Cr0wn-Gh0ul/OpenRouter-Terminal/releases/latest/download/openrouter-darwin-arm64 -o openrouter
chmod +x openrouter
sudo mv openrouter /usr/local/bin/
```

**macOS (Intel):**
```bash
curl -L https://github.com/Cr0wn-Gh0ul/OpenRouter-Terminal/releases/latest/download/openrouter-darwin-x64 -o openrouter
chmod +x openrouter
sudo mv openrouter /usr/local/bin/
```

### Build from Source

Requires Node.js 20 or later.

```bash
git clone https://github.com/Cr0wn-Gh0ul/OpenRouter-Terminal.git
cd OpenRouter-Terminal
npm install
npm run build
npm link
```

To build a standalone executable:

```bash
npm run build:sea
# Binary will be in bin/
```

## Quick Start

1. Get an API key from [OpenRouter](https://openrouter.ai/keys)

2. Set your API key:
   ```bash
   openrouter -k your-api-key-here
   ```

3. Start chatting:
   ```bash
   openrouter
   ```

## Usage

### Command Line Options

```
openrouter [options]

Options:
  -V, --version            Output version number
  -k, --api-key <key>      Set OpenRouter API key
  -m, --model <model>      Use a specific model
  -p, --system <prompt>    Set a system prompt
  -o, --oneshot <message>  Send a single message and exit
  -c, --config             Show current configuration
  -t, --tools              List registered tools
  -x, --context            Show files in context
  -l, --load <file>        Load a saved session
  -s, --session <name>     Use a named session (auto-saves)
  --sessions               List all saved sessions
  -h, --help               Display help
```

### Examples

```bash
# Start interactive chat
openrouter

# Send a quick one-shot message
openrouter -o "Explain quantum computing in simple terms"

# Use a specific model
openrouter -m anthropic/claude-sonnet-4

# Set a custom system prompt
openrouter -p "You are a helpful coding assistant"

# Start with a named session (auto-saves after each message)
openrouter -s myproject

# Load a previously saved session
openrouter -l myproject
```

## Interactive Commands

Type `help` in interactive mode to see all available commands:

| Category | Command | Description |
|----------|---------|-------------|
| General | `help` | Show help message |
| | `clear` | Clear conversation history |
| | `usage` | Show token/cost usage for session |
| | `exit`, `quit` | Exit the chat |
| Model | `model` | Show current model |
| | `model <name>` | Switch to a different model |
| | `models` | Browse and select from available models |
| Context | `context` | Show files in context |
| | `context <file...>` | Add file(s) to message context |
| | `context clear` | Clear all context files |
| Tools | `tools` | List registered tools |
| | `tools add <path>` | Add a tool file or directory |
| Sessions | `sessions` | List all saved sessions |
| | `save <name>` | Save conversation to a session file |
| | `save <name> md` | Export conversation as Markdown |
| | `load <name>` | Load a saved session |
| | `history` | Show conversation history |
| | `branch <n>` | Rewind to message N (for branching) |
| Config | `config` | Show current configuration |
| | `system <prompt>` | Set a new system prompt |
| | `key <apikey>` | Set and save API key |
| File Changes | `undo` | Undo the last file change |
| | `undo <id>` | Undo a specific change by ID |
| | `changes` | List recent file changes |

## Built-in Tools

The AI has access to these built-in tools:

| Tool | Description |
|------|-------------|
| `read_file` | Read file contents (with line range support) |
| `write_file` | Create or overwrite files |
| `edit_file` | Find and replace text with diff preview |
| `search_code` | Search codebase with regex patterns |
| `list_files` | List directory contents |
| `file_info` | Get file metadata (size, modified, etc.) |
| `shell` | Execute shell commands (with safety checks) |
| `undo_change` | Revert a file change |
| `list_changes` | Show recent file changes |

All file modifications are tracked and can be undone using the `undo` command or `undo_change` tool.

## Custom Tools (Function Calling)

Extend the AI's capabilities with custom tools. Tools are JavaScript modules that the AI can call during conversations.

### Adding Tools

Via interactive mode:
```
> tools add /path/to/tools
Added tool path: /path/to/tools
Loaded 3 new tool(s). Total: 3 custom tools.
```

Via config file (`~/.config/openrouter-terminal/config.json`):
```json
{
  "toolPaths": ["/path/to/tools", "/path/to/specific/tool.js"]
}
```

### Creating Tools

```javascript
// my_tool.js
export default {
    name: 'my_tool',
    description: 'Description for the AI to understand when to use it',
    parameters: {
        type: 'object',
        properties: {
            param1: { type: 'string', description: 'First parameter' },
            param2: { type: 'number', description: 'Second parameter' },
        },
        required: ['param1'],
    },
    execute: async (args) => {
        const { param1, param2 } = args;
        // Do something...
        return 'Result as a string';
    },
};
```

See [examples/tools/](examples/tools/) for sample tools including:
- **get_time.js** - Get current date/time in various formats and timezones
- **calculator.js** - Perform basic arithmetic calculations

## Context Management

Add files to provide context to the AI. Context files are included with every message, helping the AI understand your codebase.

### Adding Context Files

```bash
# From command line
openrouter -x                    # Show current context
openrouter                       # Then add files in interactive mode
```

```
# In interactive mode
> context                        # Show files in context
> context src/index.ts           # Add a single file
> context src/*.ts               # Add multiple files
> context clear                  # Clear all context files
```

### Persistent Context

Context files are saved to your config and restored on restart:

```json
{
  "contextPaths": ["/path/to/file.txt", "/path/to/another.js"]
}
```

## File Changes and Undo

All file modifications made by the AI are tracked with full undo support. Every `write_file` and `edit_file` operation is recorded so you can safely let the AI make changes.

### Viewing Changes

```
> changes

Recent File Changes
──────────────────────────────────────────────────
1. CREATE src/utils/helper.ts
   ID: a1b2c3d4 | 2:34:15 PM
2. EDIT   src/index.ts
   ID: e5f6g7h8 | 2:33:42 PM
```

### Undoing Changes

```
> undo                           # Undo the most recent change
> undo a1b2c3d4                  # Undo a specific change by ID
```

The AI can also undo changes using the `undo_change` and `list_changes` tools.

## Session Management

### Named Sessions (Auto-Save)

Start with a named session to automatically save after each message:

```bash
openrouter -s myproject
```

### Manual Save/Load

```
> save research
Session saved: ~/.config/openrouter-terminal/sessions/research.json

> save research md
Session saved as Markdown: ~/.config/openrouter-terminal/sessions/research.md

> load research
Loaded session: research
```

### Conversation Branching

Go back to any point in the conversation and branch off:

```
> history
  [0] system: You are a helpful assistant...
  [1] user: Write a story about a robot
  [2] assistant: Once upon a time...
  [3] user: Make it scarier
  [4] assistant: The robot's eyes glowed red...

> branch 2
Rewound to message 2. Conversation branched.

> Make it funnier instead
```

## Token and Cost Tracking

Every message shows token usage and cost:

```
(anthropic/claude-sonnet-4)> Hello!

Hello! How can I help you today?

[1.2K in, 45 out | $0.0023]
```

View session totals with the `usage` command:

```
> usage

Session Usage:
  Messages: 5
  Tokens:   12.3K in, 3.2K out (15.5K total)
  Cost:     $0.0234
```

## Configuration

Configuration is stored at `~/.config/openrouter-terminal/config.json`:

```json
{
  "apiKey": "sk-or-...",
  "model": "anthropic/claude-sonnet-4",
  "systemPrompt": "You are a helpful assistant",
  "toolPaths": ["/path/to/tools"],
  "contextPaths": ["/path/to/file.txt"]
}
```

Sessions are stored at `~/.config/openrouter-terminal/sessions/`.

## License

MIT
