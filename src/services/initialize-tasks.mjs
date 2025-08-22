import { loadTaskConfig, saveTaskConfig } from '../config.mjs';

/**
 * 重置单个任务的状态和结果字段
 * @param {Object} task - 任务对象
 * @returns {Object} - 重置信息
 */
const resetTaskFields = (task) => {
  const previousStatus = task.status || 'pending';
  const previousResult = task.result || '';

  task.status = 'pending';
  task.result = '';

  return {
    key: task.key || null,
    number: task.number,
    previousStatus,
    previousResult,
  };
};

/**
 * 重置所有任务和子任务的状态和结果字段
 * @param {Object} taskConfig - 任务配置对象
 * @param {Object} log - 日志对象
 * @returns {Object} - 重置结果统计
 */
const initializeTasks = ({ taskConfig, log }) => {
  const resetTasks = [];
  const resetSubtasks = [];

  // 重置所有主任务
  taskConfig.tasks.forEach((task) => {
    const resetInfo = resetTaskFields(task);
    resetTasks.push({
      ...resetInfo,
      type: 'task',
    });

    log.info(
      `重置任务 ${task.number} (key: ${task.key || 'N/A'}) 状态: ${resetInfo.previousStatus} → pending, 结果: "${resetInfo.previousResult}" → ""`
    );

    // 重置所有子任务
    if (Array.isArray(task.subtasks)) {
      task.subtasks.forEach((subtask) => {
        const subtaskResetInfo = resetTaskFields(subtask);
        resetSubtasks.push({
          ...subtaskResetInfo,
          type: 'subtask',
          parentNumber: task.number,
        });

        log.info(
          `重置子任务 ${subtask.number} (key: ${subtask.key || 'N/A'}) 状态: ${subtaskResetInfo.previousStatus} → pending, 结果: "${subtaskResetInfo.previousResult}" → ""`
        );
      });
    }
  });

  return {
    status: 'success',
    data: {
      resetTasks,
      resetSubtasks,
      totalTasks: resetTasks.length,
      totalSubtasks: resetSubtasks.length,
      totalItems: resetTasks.length + resetSubtasks.length,
    },
  };
};

/**
 * 项目初始化服务（主入口）
 * @param {Object} log - 日志对象
 * @returns {Promise<Object>} - 项目初始化结果
 */
export const initializeTasksService = async (log) => {
  try {
    const taskConfig = loadTaskConfig();

    if (!taskConfig || !taskConfig.tasks) {
      return {
        status: 'error',
        error: '配置文件中未找到有效的任务列表',
      };
    }

    const result = initializeTasks({ taskConfig, log });

    // 保存更新后的配置
    saveTaskConfig(taskConfig);
    log.info('任务配置文件已成功保存');

    // 构建详细的成功响应
    const message = `成功重置任务: 共重置 ${result.data.totalTasks} 个任务和 ${result.data.totalSubtasks} 个子任务 (总计 ${result.data.totalItems} 项)，所有状态已设置为 "pending"，所有结果字段已清空`;

    return {
      status: 'success',
      data: {
        message,
        resetTasks: result.data.resetTasks,
        resetSubtasks: result.data.resetSubtasks,
        totalTasks: result.data.totalTasks,
        totalSubtasks: result.data.totalSubtasks,
        totalItems: result.data.totalItems,
        configSaved: true,
      },
    };
  } catch (error) {
    return {
      status: 'error',
      error: `任务初始化失败: ${error.message}`,
    };
  }
};

export default initializeTasksService;
