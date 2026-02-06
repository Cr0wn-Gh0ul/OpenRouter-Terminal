/**
 * Agent Loop Implementation
 * 
 * Implements the agentic behavior for tool-using conversations.
 * The agent loop continues until the model responds without requesting
 * any tool calls, or until the maximum iteration limit is reached.
 * 
 * @module core/agent
 */
import type { Message } from '../types';
import { getClient } from './client';
import { toSDKMessages } from './messages';
import { getOpenRouterTools, executeTool, ToolCall } from '../tools';
import type { TokenUsage } from '../usage';
import { colors, formatInfo, formatMuted, formatError } from '../ui';

const MAX_AGENT_ITERATIONS = 10;

export interface AgentLoopResult {
    response: string;
    usage: TokenUsage;
}

// Executes the agent loop until the model completes without tool calls
export async function runAgentLoop(
    conversationHistory: Message[],
    model: string
): Promise<AgentLoopResult> {
    const client = getClient();
    const tools = getOpenRouterTools();
    const hasTools = tools.length > 0;
    
    let totalUsage: TokenUsage = {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
    };
    let finalResponse = '';
    let iteration = 0;

    while (iteration < MAX_AGENT_ITERATIONS) {
        iteration++;
        
        const stream = await client.chat.send({
            model,
            messages: toSDKMessages(conversationHistory) as any,
            stream: true,
            ...(hasTools ? { tools } : {}),
        });

        let fullResponse = '';
        let toolCalls: ToolCall[] = [];
        let usage: TokenUsage | undefined;

        for await (const chunk of stream) {
            const choice = chunk.choices[0];
            
            const content = choice?.delta?.content;
            if (content) {
                process.stdout.write(content);
                fullResponse += content;
            }

            const delta = choice?.delta as any;
            if (delta?.toolCalls) {
                for (const tc of delta.toolCalls) {
                    const index = tc.index ?? 0;
                    if (!toolCalls[index]) {
                        toolCalls[index] = {
                            id: tc.id || '',
                            type: 'function',
                            function: {
                                name: tc.function?.name || '',
                                arguments: tc.function?.arguments || '',
                            },
                        };
                    } else {
                        if (tc.id) toolCalls[index].id = tc.id;
                        if (tc.function?.name) toolCalls[index].function.name = tc.function.name;
                        if (tc.function?.arguments) toolCalls[index].function.arguments += tc.function.arguments;
                    }
                }
            }
            
            const chunkUsage = (chunk as any).usage;
            if (chunkUsage) {
                usage = {
                    promptTokens: chunkUsage.prompt_tokens || chunkUsage.promptTokens || 0,
                    completionTokens: chunkUsage.completion_tokens || chunkUsage.completionTokens || 0,
                    totalTokens: chunkUsage.total_tokens || chunkUsage.totalTokens || 0,
                };
            }
        }

        if (usage) {
            totalUsage.promptTokens += usage.promptTokens;
            totalUsage.completionTokens += usage.completionTokens;
            totalUsage.totalTokens += usage.totalTokens;
        }

        toolCalls = toolCalls.filter(tc => tc.id && tc.function.name);

        if (toolCalls.length === 0) {
            conversationHistory.push({ role: 'assistant', content: fullResponse });
            finalResponse = fullResponse;
            break;
        }

        conversationHistory.push({
            role: 'assistant',
            content: fullResponse || null,
            tool_calls: toolCalls,
        } as Message);

        for (const tc of toolCalls) {
            console.log(formatInfo(`\n[Calling tool: ${tc.function.name}]`));
            
            try {
                const args = JSON.parse(tc.function.arguments);
                const result = await executeTool(tc.function.name, args);
                const sanitized = result.replace(/\s+/g, ' ').trim();
                const preview = sanitized.length > 100 ? sanitized.substring(0, 100) + '...' : sanitized;
                console.log(formatMuted(`[Result: ${preview}]`));
                
                conversationHistory.push({
                    role: 'tool',
                    tool_call_id: tc.id,
                    content: result,
                } as Message);
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Tool execution failed';
                console.log(formatError(`[Tool error: ${errorMsg}]`));
                
                conversationHistory.push({
                    role: 'tool',
                    tool_call_id: tc.id,
                    content: `Error: ${errorMsg}`,
                } as Message);
            }
        }

        // Newline before next iteration's response
        console.log();
    }

    if (iteration >= MAX_AGENT_ITERATIONS) {
        console.log(formatInfo(`\n[Agent reached max iterations (${MAX_AGENT_ITERATIONS})]`));
    }

    return { response: finalResponse, usage: totalUsage };
}
