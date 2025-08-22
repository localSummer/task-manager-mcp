import { registerGetTaskRulesPrompt } from './get-task-rules.mjs';

/**
 * Register all MCP prompts with the server
 * @param {Object} server - The MCP server instance
 */
export function registerAllPrompts(server) {
  // Register task management rules prompt
  registerGetTaskRulesPrompt(server);
}

export default {
  registerAllPrompts,
};
