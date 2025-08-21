import { z } from 'zod';
import { handleApiResult } from './utils.mjs';
import { setTaskStatusService } from '../services/set-task-status.mjs';
import { TASK_STATUS_OPTIONS } from '../constant.mjs';

/**
 * Register the set_task_status tool with the MCP server
 * @param {Object} server - The MCP server instance
 */
export function registerSetTaskStatusTool(server) {
  server.addTool({
    name: 'set_task_status',
    description:
      'Set the status of one or more tasks or subtasks. 设置一个或多个任务或子任务的状态',
    parameters: z.object({
      identifier: z
        .string()
        .describe(
          "Task Number or subtask Number (e.g., '1', '1.1') or Task Key or subtask Key. Can be comma-separated to update multiple tasks/subtasks at once."
        ),
      status: z
        .enum(TASK_STATUS_OPTIONS)
        .describe(
          "New status to set (e.g., 'pending', 'done', 'in-progress', 'review', 'deferred', 'cancelled')."
        ),
    }),
    execute: async (args, context) => {
      const { log } = context;
      log.info(`Set task status with args: ${JSON.stringify(args)}`);

      const response = await setTaskStatusService(
        args.identifier,
        args.status,
        log
      );

      log.info(`Set task status response: ${JSON.stringify(response)}`);
      return handleApiResult(response, log, 'set_task_status');
    },
  });
}

export default {
  registerSetTaskStatusTool,
};