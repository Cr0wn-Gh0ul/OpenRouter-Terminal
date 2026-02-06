/**
 * Core Module - Barrel Export
 * 
 * Centralizes exports for the core chat and agent functionality.
 * Includes client management, message streaming, and the agent loop.
 * 
 * @module core
 */
export { initClient, getClient } from './client';
export { streamMessage, type StreamResult, type StreamOptions } from './chat';
export { runAgentLoop, type AgentLoopResult, type AgentLoopOptions } from './agent';
export { toSDKMessages } from './messages';
