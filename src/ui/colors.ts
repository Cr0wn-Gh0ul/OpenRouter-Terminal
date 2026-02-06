/**
 * Color Scheme Definitions
 * 
 * Centralizes the application's color palette using chalk.
 * Provides semantic color mappings for consistent terminal output styling.
 * 
 * @module ui/colors
 */
import chalk from 'chalk';

export const colors = {
    // Primary palette
    primary: chalk.cyan,
    secondary: chalk.yellow,
    success: chalk.green,
    error: chalk.red,
    warning: chalk.yellow,
    muted: chalk.gray,

    // Semantic assignments
    prompt: chalk.green,
    assistant: chalk.magenta,
    info: chalk.cyan,
    highlight: chalk.bold.white,

    // UI element styling
    header: chalk.cyan.bold,
    separator: chalk.gray,
    command: chalk.yellow,
    description: chalk.white,
};

export default colors;
