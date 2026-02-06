/**
 * Model Command Handlers
 * 
 * Handlers for model-related commands: viewing, switching, and browsing.
 * 
 * @module interactive/handlers/model
 */
import type { InteractiveState, HandlerResult } from '../state';
import { selectModel } from '../../models';
import { updateConfig } from '../../config';
import { formatInfo } from '../../ui';

export async function handleShowModel(_input: string, state: InteractiveState): Promise<HandlerResult> {
    console.log(formatInfo(`Current model: ${state.options.model}\n`));
    return { continue: true };
}

export async function handleSetModel(input: string, state: InteractiveState): Promise<HandlerResult> {
    const newModel = input.slice(6).trim();
    state.options.model = newModel;
    state.model = newModel;
    updateConfig({ model: newModel });
    console.log(formatInfo(`Switched to model: ${newModel}\n`));
    return { continue: true };
}

export async function handleModels(_input: string, state: InteractiveState): Promise<HandlerResult> {
    const selected = await selectModel(state.apiKey);
    if (selected) {
        state.options.model = selected;
        state.model = selected;
        updateConfig({ model: selected });
        console.log(formatInfo(`Switched to model: ${selected}\n`));
    }
    return { continue: true, restart: true };
}
