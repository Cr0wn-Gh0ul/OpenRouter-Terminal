/**
 * Interactive Model Selection
 * 
 * Provides a terminal-based UI for browsing and selecting
 * models from available providers.
 * 
 * @module models/selection
 */
import * as readline from 'readline';
import { fetchModels, groupModelsByProvider, formatModelPricing } from './fetch';
import { colors, formatInfo, formatError, formatSuccess } from '../ui';

export async function selectModel(apiKey: string): Promise<string | null> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const question = (prompt: string): Promise<string> => {
        return new Promise((resolve) => {
            rl.question(prompt, resolve);
        });
    };

    try {
        console.log(formatInfo('Fetching available models...'));
        const models = await fetchModels(apiKey);
        const providers = groupModelsByProvider(models);
        const providerList = Array.from(providers.keys()).sort();

        // Display providers
        console.log(colors.primary('\nAvailable providers:'));
        providerList.forEach((provider, index) => {
            const count = providers.get(provider)!.length;
            console.log(colors.secondary(`  ${index + 1}. ${provider} (${count} models)`));
        });

        // Select provider
        const providerInput = await question(colors.prompt('\nSelect provider (number or name): '));
        let selectedProvider: string;

        const providerNum = parseInt(providerInput, 10);
        if (!isNaN(providerNum) && providerNum >= 1 && providerNum <= providerList.length) {
            selectedProvider = providerList[providerNum - 1];
        } else if (providerList.includes(providerInput.toLowerCase())) {
            selectedProvider = providerInput.toLowerCase();
        } else {
            // Try partial match
            const match = providerList.find(p => p.toLowerCase().includes(providerInput.toLowerCase()));
            if (match) {
                selectedProvider = match;
            } else {
                console.log(formatError('Provider not found.'));
                rl.close();
                return null;
            }
        }

        // Display models for selected provider
        const providerModels = providers.get(selectedProvider)!;
        console.log(colors.primary(`\nModels from ${selectedProvider}:`));
        providerModels.forEach((model, index) => {
            const pricing = formatModelPricing(model);
            console.log(colors.secondary(`  ${index + 1}. ${model.id}`));
            console.log(colors.secondary(`     Context: ${model.context_length.toLocaleString()} | ${pricing}`));
        });

        // Select model
        const modelInput = await question(colors.prompt('\nSelect model (number or name): '));
        let selectedModel = providerModels.find((_, index) => {
            const modelNum = parseInt(modelInput, 10);
            return !isNaN(modelNum) && modelNum === index + 1;
        });

        if (!selectedModel) {
            // Try partial match on model id
            selectedModel = providerModels.find(m => 
                m.id.toLowerCase().includes(modelInput.toLowerCase())
            );
        }

        if (selectedModel) {
            console.log(formatSuccess(`\nSelected: ${selectedModel.id}`));
            rl.close();
            return selectedModel.id;
        } else {
            console.log(formatError('Model not found.'));
            rl.close();
            return null;
        }
    } catch (error) {
        console.error(formatError(error instanceof Error ? error.message : 'Failed to fetch models'));
        rl.close();
        return null;
    }
}
