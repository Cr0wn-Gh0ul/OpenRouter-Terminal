/**
 * CLI Program Definition
 * 
 * Configures the Commander.js program with all available options,
 * help text, and version information.
 * 
 * @module cli/program
 */
import { Command } from 'commander';
import type { CLIOptions } from '../types';

export function createProgram(): Command {
    const program = new Command();

    program
        .name('openrouter')
        .description('A CLI tool for chatting with AI models via OpenRouter')
        .version('1.0.0');

    program
        .option('-k, --api-key <key>', 'Set OpenRouter API key')
        .option('-m, --model <model>', 'Set model to use')
        .option('-p, --system <prompt>', 'Set System prompt')
        .option('-o, --oneshot <message>', 'Send a single message and exit')
        .option('-c, --config', 'Show config file')
        .option('-t, --tools', 'Show registered tools')
        .option('-x, --context', 'Show files for message context')
        .option('-l, --load <file>', 'Load a saved session file')
        .option('-s, --session <name>', 'Use a named session (auto-saves)')
        .option('--sessions', 'List all saved sessions')
        .addHelpText('after', `
Examples:
  $ openrouter                           Start interactive chat
  $ openrouter -o "Hello!"               Send a single message
  $ openrouter -m openai/gpt-4o          Use a different model
  $ openrouter -p "You are a pirate"     Set a system prompt
  $ openrouter -k <key>                  Specify API key
  $ openrouter -t                        List registered tools
  $ openrouter -c                        Show config file
  $ openrouter -x                        Show files for message context
  $ openrouter -s myproject              Use named session (auto-saves)
  $ openrouter -l session.json           Load a saved session
  $ openrouter --sessions                List all saved sessions
`);

    return program;
}

export function parseArgs(program: Command): CLIOptions {
    program.parse(process.argv);
    return program.opts<CLIOptions>();
}
