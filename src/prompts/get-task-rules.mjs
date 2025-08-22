import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getTasksResultOutputDir } from '../config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 获取任务管理规则 Prompt
 * 从 task-manager-rule.md 文件加载完整的任务管理规则
 * 支持选择特定章节，任务结果输出目录从配置文件中自动获取
 */
export function registerGetTaskRulesPrompt(server) {
  server.addPrompt({
    name: 'get-task-rules',
    description:
      '获取任务管理系统的执行规则和指导原则，输出完整的任务管理规则文档',
    arguments: [],
    async load() {
      try {
        // 读取任务管理规则文件
        const rulesFilePath = join(__dirname, 'task-manager-rule.md');
        let rulesContent = readFileSync(rulesFilePath, 'utf8');

        // 从配置文件中获取任务结果输出目录并替换占位符
        try {
          const tasksResultOutputDir = getTasksResultOutputDir();
          rulesContent = rulesContent.replace(
            /\{\{\{tasksResultOutputDir\}\}\}/g,
            tasksResultOutputDir
          );
        } catch (configError) {
          // 如果配置获取失败，保留占位符并添加错误提示
          rulesContent = rulesContent.replace(
            /\{\{\{tasksResultOutputDir\}\}\}/g,
            'src/task-results'
          );
        }

        return rulesContent;
      } catch (error) {
        return `获取任务管理规则时发生错误: ${error.message}`;
      }
    },
  });
}

export default {
  registerGetTaskRulesPrompt,
};
