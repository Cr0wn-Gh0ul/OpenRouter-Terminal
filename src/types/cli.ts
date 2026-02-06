/**
 * CLI Options Type Definitions
 * 
 * Defines the command-line interface options structure parsed
 * by Commander.js from user-provided arguments.
 * 
 * @module types/cli
 */

export interface CLIOptions {
    apiKey?: string;
    model?: string;
    system?: string;
    oneshot?: string;
    maxIterations?: number;
    config?: boolean;
    tools?: boolean;
    context?: boolean;
    load?: string;
    session?: string;
    sessions?: boolean;
}
