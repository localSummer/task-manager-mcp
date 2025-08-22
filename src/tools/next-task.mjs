import { handleApiResult } from './utils.mjs';
import { getNextTaskService } from '../services/next-task.mjs';

/**
 * Register the get_next_task tool with the MCP server
 * @param {Object} server - The MCP server instance
 */
export function registerNextTaskTool(server) {
  server.addTool({
    name: 'next_task',
    description:
      'Find the next task to work on based on precondition and status 基于前置条件依赖和状态找到下一个任务',
    execute: async (args, context) => {
      const { log } = context;
      log.info(`Find next task with args: ${JSON.stringify(args)}`);
      const response = await getNextTaskService();
      log.info(`Next task response: ${JSON.stringify(response)}`);
      return handleApiResult(response, log, 'next_task');
    },
  });
}

export default {
  registerNextTaskTool,
};
