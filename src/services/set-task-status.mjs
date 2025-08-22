import { loadTaskConfig, saveTaskConfig } from '../config.mjs';
import { TASK_STATUS_OPTIONS } from '../constant.mjs';
import {
  isValidTaskStatus,
  buildKeyToNumberMap,
  findTaskByKeyOrNumber,
  checkPreconditions,
} from './utils.mjs';

/**
 * 更新单个任务状态
 * @param {Object} params
 * @param {string} params.identifier - 任务的 key 或 number
 * @param {string} params.newStatus - 新状态
 * @param {Array} params.tasks - 任务列表
 * @param {Map<string, string>} params.keyToNumberMap - key 到 number 的映射
 * @param {Object} params.log - 日志对象
 * @param {boolean} params.skipPreconditionCheck - 是否跳过前置条件检查（默认false）
 */
const updateSingleTaskStatus = ({
  identifier,
  newStatus,
  tasks,
  keyToNumberMap,
  log,
  skipPreconditionCheck = false,
}) => {
  const taskInfo = findTaskByKeyOrNumber(identifier, tasks, keyToNumberMap);

  if (!taskInfo) {
    throw new Error(`Task with identifier '${identifier}' not found`);
  }

  const { type, task, parentTask, fullNumber } = taskInfo;

  // 检查前置条件（仅在设置为 in-progress 或 done 时）
  if (
    !skipPreconditionCheck &&
    (newStatus.toLowerCase() === 'in-progress' ||
      newStatus.toLowerCase() === 'done' ||
      newStatus.toLowerCase() === 'completed')
  ) {
    const preconditionCheck = checkPreconditions(task, tasks, keyToNumberMap);
    if (!preconditionCheck.satisfied) {
      const unsatisfiedInfo = preconditionCheck.unsatisfiedDeps
        .map(
          (dep) =>
            `${dep.key}${dep.number ? ` (${dep.number})` : ''}: ${dep.reason}${
              dep.currentStatus ? ` (current: ${dep.currentStatus})` : ''
            }`
        )
        .join(', ');

      log.warn(
        `Warning: Task ${fullNumber} has unsatisfied preconditions: ${unsatisfiedInfo}. Proceeding anyway.`
      );
    }
  }

  // 存储旧状态
  const previousStatus = task.status || 'pending';

  if (type === 'subtask') {
    // 更新子任务状态
    task.status = newStatus;

    log.info(
      `Updated subtask ${fullNumber} (key: ${
        task.key || 'N/A'
      }) status from '${previousStatus}' to '${newStatus}'`
    );

    // 检查所有子任务是否完成
    if (
      newStatus.toLowerCase() === 'done' ||
      newStatus.toLowerCase() === 'completed'
    ) {
      const allSubtasksDone = parentTask.subtasks.every(
        (st) => st.status === 'done' || st.status === 'completed'
      );

      if (
        allSubtasksDone &&
        parentTask.status !== 'done' &&
        parentTask.status !== 'completed'
      ) {
        log.warn(
          `All subtasks for task ${parentTask.number} are done. Suggest updating parent task status to 'done'`
        );
      }
    }
  } else {
    // 处理常规任务
    task.status = newStatus;

    log.info(
      `Updated task ${fullNumber} (key: ${
        task.key || 'N/A'
      }) status from '${previousStatus}' to '${newStatus}'`
    );

    // 如果任务设置为完成，同时更新所有子任务
    if (
      (newStatus.toLowerCase() === 'done' ||
        newStatus.toLowerCase() === 'completed') &&
      task.subtasks &&
      task.subtasks.length > 0
    ) {
      const pendingSubtasks = task.subtasks.filter(
        (st) => st.status !== 'done' && st.status !== 'completed'
      );
      if (pendingSubtasks.length > 0) {
        log.info(
          `Also marking ${pendingSubtasks.length} subtasks as '${newStatus}'`
        );

        pendingSubtasks.forEach((subtask) => {
          subtask.status = newStatus;
        });
      }
    }

    // 如果任务设置为 pending，重置已完成的子任务
    if (
      newStatus.toLowerCase() === 'pending' &&
      task.subtasks &&
      task.subtasks.length > 0
    ) {
      const completedSubtasks = task.subtasks.filter(
        (st) => st.status === 'done' || st.status === 'completed'
      );
      if (completedSubtasks.length > 0) {
        log.warn(
          `父任务设置为 pending，同时将 ${completedSubtasks.length} 个已完成子任务重置为 pending。`
        );
        completedSubtasks.forEach((subtask) => {
          subtask.status = newStatus;
        });
      }
    }
  }

  return {
    taskKey: task.key,
    taskTitle: task.title,
    previousStatus,
    newStatus,
    fullNumber,
  };
};

/**
 * 设置任务状态的核心逻辑
 * @param {Object} taskConfig - 任务配置对象
 * @param {string} identifierInput - 任务的 key 或 number（支持逗号分隔的多个值）
 * @param {string} newStatus - 新状态
 * @param {Object} log - 日志对象
 */
const setTaskStatus = ({ taskConfig, identifierInput, newStatus, log }) => {
  if (!isValidTaskStatus(newStatus)) {
    throw new Error(
      `Error: Invalid status value: ${newStatus}. Use one of: ${TASK_STATUS_OPTIONS.join(
        ', '
      )}`
    );
  }

  const identifiers = identifierInput.split(',').map((id) => id.trim());
  const updatedTasks = [];
  const keyToNumberMap = buildKeyToNumberMap(taskConfig.tasks);

  // 更新每个任务
  for (const identifier of identifiers) {
    const updateResult = updateSingleTaskStatus({
      identifier,
      newStatus,
      tasks: taskConfig.tasks,
      keyToNumberMap,
      log,
    });

    // 获取任务信息用于返回结果
    const taskInfo = findTaskByKeyOrNumber(
      identifier,
      taskConfig.tasks,
      keyToNumberMap
    );

    if (taskInfo) {
      const taskResult = {
        identifier,
        number: taskInfo.fullNumber,
        key: taskInfo.task.key || null,
        status: newStatus,
        previousStatus: updateResult.previousStatus,
      };

      updatedTasks.push(taskResult);
    }
  }

  return {
    status: 'success',
    data: {
      updatedTasks,
      totalUpdated: updatedTasks.length,
    },
  };
};

/**
 * 任务状态设置服务（主入口）
 * @param {string} identifier - 任务的 key 或 number（支持逗号分隔的多个值）
 * @param {string} status - 任务状态
 * @param {Object} log - 日志对象
 * @returns {Promise<Object>} - 任务状态更新结果
 */
export const setTaskStatusService = async (identifier, status, log) => {
  if (!identifier) {
    return {
      status: 'error',
      error:
        'No task identifier specified. Please provide a task key or number to update.',
    };
  }

  if (!status) {
    return {
      status: 'error',
      error: 'No status specified. Please provide a new status value.',
    };
  }

  try {
    const taskConfig = loadTaskConfig();

    if (!taskConfig || !taskConfig.tasks) {
      return {
        status: 'error',
        error: `No valid tasks found in configuration`,
      };
    }

    const result = setTaskStatus({
      taskConfig,
      identifierInput: identifier,
      newStatus: status,
      log,
    });

    // 保存更新后的配置
    saveTaskConfig(taskConfig);
    log.info(`Task configuration saved successfully`);

    // 构建更详细的成功响应
    const updatedTasksInfo = result.data.updatedTasks
      .map((task) => {
        const taskDesc = task.key
          ? `${task.key} (${task.number})`
          : task.number;
        const statusChange =
          task.previousStatus !== task.status
            ? ` [${task.previousStatus} → ${task.status}]`
            : '';
        return taskDesc + statusChange;
      })
      .join(', ');

    return {
      status: 'success',
      data: {
        message: `Successfully updated ${result.data.totalUpdated} task(s): ${updatedTasksInfo} to status "${status}"`,
        updatedTasks: result.data.updatedTasks,
        totalUpdated: result.data.totalUpdated,
        configSaved: true,
      },
    };
  } catch (error) {
    return {
      status: 'error',
      error: `Error setting task status: ${error.message}`,
    };
  }
};

export default setTaskStatusService;
