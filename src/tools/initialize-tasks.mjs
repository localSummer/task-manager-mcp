import { z } from 'zod';
import { handleApiResult } from './utils.mjs';
import { initializeTasksService } from '../services/initialize-tasks.mjs';

/**
 * Register the initialize_project tool with the MCP server
 * @param {Object} server - The MCP server instance
 */
export function registerInitializeTasksTool(server) {
  server.addTool({
    name: 'initialize_tasks',
    description:
      'Initialize project by resetting all tasks and subtasks status to "pending" and result to empty string. 重置项目中所有任务和子任务的状态为"pending"，结果字段为空字符串',
    parameters: z.object({}), // 无需参数
    execute: async (args, context) => {
      const { log } = context;
      log.info('开始初始化任务 - 重置所有任务状态和结果字段');

      const response = await initializeTasksService(log);

      log.info(`任务初始化响应: ${JSON.stringify(response)}`);
      return handleApiResult(response, log, 'initialize_tasks');
    },
  });
}

export default {
  registerInitializeTasksTool,
};
