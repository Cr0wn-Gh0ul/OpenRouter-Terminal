/**
 * Models Module - Barrel Export
 * 
 * Centralizes exports for model fetching, grouping, and selection.
 * 
 * @module models
 */
export type { OpenRouterModel, ModelsResponse } from './types';
export { fetchModels, groupModelsByProvider, formatModelPricing } from './fetch';
export { selectModel } from './selection';
