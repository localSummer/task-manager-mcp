import fs from 'fs';
import path from 'path';

/**
 * 获取任务配置文件路径
 * @returns {string} 任务配置文件的完整路径
 * @throws {Error} 如果未设置 TASK_CONFIG_PATH 环境变量
 */
export function getTaskConfigPath() {
  const configPath = process.env.TASK_CONFIG_PATH;

  if (!configPath) {
    throw new Error(
      'TASK_CONFIG_PATH environment variable is required. Please set it to the full path of your task configuration file.'
    );
  }

  if (!path.isAbsolute(configPath)) {
    throw new Error(
      `TASK_CONFIG_PATH must be an absolute path. Got: ${configPath}`
    );
  }

  return configPath;
}

/**
 * 验证任务配置文件是否存在
 * @param {string} configPath - 配置文件路径
 * @returns {boolean} 配置文件是否存在
 */
export function validateConfigFile(configPath) {
  try {
    return fs.existsSync(configPath) && fs.statSync(configPath).isFile();
  } catch (error) {
    return false;
  }
}

/**
 * 加载任务配置
 * @returns {Object} 解析后的任务配置对象
 * @throws {Error} 如果配置文件不存在或格式不正确
 */
export function loadTaskConfig() {
  const configPath = getTaskConfigPath();

  if (!validateConfigFile(configPath)) {
    throw new Error(`Task configuration file does not exist: ${configPath}`);
  }

  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configContent);

    // 基础结构验证
    if (!config.tasks || !Array.isArray(config.tasks)) {
      throw new Error('Configuration file must contain a "tasks" array');
    }

    return config;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `Invalid JSON format in configuration file: ${configPath}`
      );
    }
    throw error;
  }
}

/**
 * 保存任务配置
 * @param {Object} config - 要保存的任务配置对象
 * @throws {Error} 如果保存失败
 */
export function saveTaskConfig(config) {
  const configPath = getTaskConfigPath();

  try {
    const configContent = JSON.stringify(config, null, 2);
    fs.writeFileSync(configPath, configContent, 'utf8');
  } catch (error) {
    throw new Error(`Failed to save task configuration: ${error.message}`);
  }
}

/**
 * 获取任务结果输出目录
 * @returns {string} 任务结果输出目录路径
 * @throws {Error} 如果配置中未设置 tasksResultOutputDir
 */
export function getTasksResultOutputDir() {
  const config = loadTaskConfig();
  const outputDir = config.meta?.tasksResultOutputDir;

  if (!outputDir) {
    throw new Error(
      'tasksResultOutputDir is not configured in the task configuration file. Please add it to the meta section.'
    );
  }

  return outputDir;
}

/**
 * 获取配置和路径的组合信息
 * @returns {Object} 包含配置对象和路径的信息
 */
export function getConfigInfo() {
  const configPath = getTaskConfigPath();
  const config = loadTaskConfig();

  return {
    configPath,
    config,
    meta: config.meta || {},
    tasks: config.tasks || [],
    tasksCount: config.tasks ? config.tasks.length : 0,
    tasksResultOutputDir: config.meta?.tasksResultOutputDir,
  };
}

export default {
  getTaskConfigPath,
  validateConfigFile,
  loadTaskConfig,
  saveTaskConfig,
  getConfigInfo,
  getTasksResultOutputDir,
};
