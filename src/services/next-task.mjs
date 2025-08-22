import { loadTaskConfig } from '../config.mjs';
import {
  buildKeyToNumberMap,
  resolveKeyToNumber,
  getNormalizedStatus,
  collectCompletedNumbers,
} from './utils.mjs';

/**
 * 查找下一个任务
 * @param {Array} tasks - 任务列表
 * @returns {Object} - 下一个任务
 */
const findNextTask = (tasks) => {
  const priorityValues = { high: 3, medium: 2, low: 1 };

  /**
   * 查找并排序符合条件的子任务
   * @param {Array} parentTasks - 父任务列表
   * @param {Set<string>} completedNumbersSet - 已完成任务number的集合
   * @param {Map<string, string>} keyToNumberMap - key到number的映射
   * @returns {Array<Object>} - 排序后的合格子任务列表
   */
  const findAndSortEligibleSubtasks = (
    parentTasks,
    completedNumbersSet,
    keyToNumberMap
  ) => {
    const candidateSubtasks = [];
    parentTasks
      .filter(
        (t) =>
          getNormalizedStatus(t.status) === 'in-progress' &&
          Array.isArray(t.subtasks)
      )
      .forEach((parent) => {
        parent.subtasks.forEach((st) => {
          const stStatus = getNormalizedStatus(st.status);
          if (stStatus !== 'pending' && stStatus !== 'in-progress') return;

          // 将 precondition 中的 key 转换为对应的 number
          const resolvedDeps = (st.precondition || [])
            .map((key) => resolveKeyToNumber(key, keyToNumberMap))
            .filter((number) => number !== null);

          const depsSatisfied =
            resolvedDeps.length === 0 ||
            resolvedDeps.every((depNumber) =>
              completedNumbersSet.has(String(depNumber))
            );

          if (depsSatisfied) {
            candidateSubtasks.push({
              number: String(st.number),
              key: st.key,
              title: st.title || `Subtask ${st.number}`,
              status: st.status || 'pending',
              priority: st.priority || parent.priority || 'medium',
              precondition: resolvedDeps,
              parentNumber: String(parent.number),
            });
          }
        });
      });

    if (candidateSubtasks.length === 0) return [];

    candidateSubtasks.sort((a, b) => {
      const pa = priorityValues[a.priority] ?? 2;
      const pb = priorityValues[b.priority] ?? 2;
      if (pb !== pa) return pb - pa;

      if (a.precondition.length !== b.precondition.length) {
        return a.precondition.length - b.precondition.length;
      }

      return Number(a.number) - Number(b.number);
    });
    return candidateSubtasks;
  };

  /**
   * 查找并排序符合条件的顶级任务
   * @param {Array} allTasks - 所有任务列表
   * @param {Set<string>} completedNumbersSet - 已完成任务number的集合
   * @param {Map<string, string>} keyToNumberMap - key到number的映射
   * @returns {Array<Object>} - 排序后的合格顶级任务列表
   */
  const findAndSortEligibleTopLevelTasks = (
    allTasks,
    completedNumbersSet,
    keyToNumberMap
  ) => {
    const eligibleTasks = allTasks.filter((task) => {
      const status = getNormalizedStatus(task.status);
      if (status !== 'pending' && status !== 'in-progress') return false;

      // 将 precondition 中的 key 转换为对应的 number
      const resolvedDeps = (task.precondition || [])
        .map((key) => resolveKeyToNumber(key, keyToNumberMap))
        .filter((number) => number !== null);

      return resolvedDeps.every((depNumber) =>
        completedNumbersSet.has(String(depNumber))
      );
    });

    if (eligibleTasks.length === 0) return [];

    eligibleTasks.sort((a, b) => {
      const pa = priorityValues[a.priority || 'medium'] ?? 2;
      const pb = priorityValues[b.priority || 'medium'] ?? 2;
      if (pb !== pa) return pb - pa;

      // 将 precondition 中的 key 转换为对应的 number 进行比较
      const resolvedDepsA = (a.precondition || [])
        .map((key) => resolveKeyToNumber(key, keyToNumberMap))
        .filter((number) => number !== null);
      const resolvedDepsB = (b.precondition || [])
        .map((key) => resolveKeyToNumber(key, keyToNumberMap))
        .filter((number) => number !== null);

      if (resolvedDepsA.length !== resolvedDepsB.length) {
        return resolvedDepsA.length - resolvedDepsB.length;
      }

      return Number(a.number) - Number(b.number);
    });
    return eligibleTasks;
  };

  // ------------- Main logic of findNextTask using helper functions ---------------
  const keyToNumberMap = buildKeyToNumberMap(tasks);
  const completedNumbers = collectCompletedNumbers(tasks);

  const eligibleSubtasks = findAndSortEligibleSubtasks(
    tasks,
    completedNumbers,
    keyToNumberMap
  );
  if (eligibleSubtasks.length > 0) {
    // 返回最高优先级的子任务
    return eligibleSubtasks[0];
  }

  const eligibleTopLevelTasks = findAndSortEligibleTopLevelTasks(
    tasks,
    completedNumbers,
    keyToNumberMap
  );
  if (eligibleTopLevelTasks.length > 0) {
    // 返回最高优先级的顶级任务
    return eligibleTopLevelTasks[0];
  }

  return null;
};

/**
 * 获取下一个任务
 * @returns {Promise<Object>} - 下一个任务
 */
export const getNextTaskService = async () => {
  try {
    const taskConfig = loadTaskConfig();

    if (!taskConfig || !taskConfig.tasks) {
      return {
        status: 'error',
        error: `No valid tasks found in configuration`,
      };
    }

    const nextTask = findNextTask(taskConfig.tasks);

    if (!nextTask) {
      return {
        status: 'success',
        data: {
          message:
            '未找到符合条件的下一个任务。所有任务要么已完成，要么存在未满足的依赖关系。',
          nextTask: null,
        },
      };
    }

    // Check if it's a subtask
    const isSubtask =
      typeof nextTask.number === 'string' && nextTask.number.includes('.');

    const taskOrSubtask = isSubtask ? 'subtask' : 'task';

    const additionalAdvice = isSubtask
      ? '子任务可以通过记录时间戳等细节，帮助在执行过程中跟踪进度、标记里程碑，并总结成功或失败的经验。建议在研究阶段及时更新子任务，以收集最新信息，这不仅有助于解决代理难以处理的重复性问题，也能提升任务完成的效率。获取任务时，建议同时获取父任务以了解整体背景，并获取子任务以掌握具体细节，从而实现更智能的任务分解与协作。'
      : '顶级任务可以根据实际进展和方向的变化进行动态调整。建议在研究阶段及时更新任务内容，以确保信息的时效性和准确性。在执行子任务时，及时同步子任务的进展；在顶级任务中，则应关注整体方向的调整，这有助于指导后续子任务的开展，并确保整个任务链条的高效协同。';

    return {
      status: 'success',
      data: {
        nextTask,
        isSubtask,
        nextSteps: `当准备好开始在 ${taskOrSubtask} 上工作时，将任务状态设置为 "in-progress"。${additionalAdvice}`,
      },
    };
  } catch (error) {
    return {
      status: 'error',
      error: `Error getting next task: ${error.message}`,
    };
  }
};

export default getNextTaskService;
