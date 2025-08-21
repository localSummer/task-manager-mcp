/**
 * @typedef {'pending' | 'done' | 'in-progress' | 'review' | 'deferred' | 'cancelled'} TaskStatus
 */

/**
 * 任务状态选项列表
 * @type {TaskStatus[]}
 * @description 定义可能的任务状态:
 * - pending: 任务等待开始
 * - done: 任务完成
 * - in-progress: 任务进行中
 * - review: 任务完成并等待审核
 * - deferred: 任务推迟或暂停
 * - cancelled: 任务取消且不会完成
 */
export const TASK_STATUS_OPTIONS = [
  'pending',
  'done',
  'in-progress',
  'review',
  'deferred',
  'cancelled',
];