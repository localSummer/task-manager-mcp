import { registerSetTaskStatusTool } from './set-task-status.mjs';
import { registerNextTaskTool } from './next-task.mjs';

/**
 * Register all MCP tools with the server
 * @param {Object} server - The MCP server instance
 */
export function registerAllTools(server) {
  // Register task status management tool
  registerSetTaskStatusTool(server);

  // Register next task discovery tool
  registerNextTaskTool(server);
}

export default {
  registerAllTools,
};
