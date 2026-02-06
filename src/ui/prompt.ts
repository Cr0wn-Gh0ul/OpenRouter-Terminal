/**
 * Prompt Styling
 * 
 * Defines the visual format for user and assistant prompts
 * displayed in the interactive REPL.
 * 
 * @module ui/prompt
 */
import { colors } from './colors';

export function getUserPrompt(): string {
    return colors.prompt('> ');
}

export function getAssistantPrompt(model: string): string {
    return colors.assistant(`(${model})>`) + ' ';
}
