# task-manager-mcp

[中文版 README](./README-zh.md) | [English README](./README.md)

一个轻量级的 MCP（模型上下文协议）服务器，用于任务管理，具有智能状态跟踪和基于前置条件的下一任务发现功能。

## 功能特性

- **任务状态管理**：设置和跟踪任务状态，支持子任务
- **智能任务发现**：基于优先级和依赖关系找到下一个可执行的任务
- **前置条件检查**：执行前自动验证任务依赖关系
- **灵活配置**：通过可自定义结构的任务 JSON 文件进行配置
- **独立部署**：无外部依赖，可独立部署

## 快速开始

⚠️ **重要提示**：`/task-manager-mcp:get-task-rules` (MCP) 是整个 MCP 系统正常运转的主要入口点。请从这个提示开始，获取所有任务管理操作的全面指导。

## 安装

```bash
git clone https://github.com/localSummer/task-manager-mcp.git
```

## MCP 客户端配置

### Cursor IDE 配置

在您的 `.cursor/mcp.json` 文件中添加以下配置：

```json
{
  "mcpServers": {
    "task-manager": {
      "command": "node",
      "args": ["/absolute/task-manager-mcp/src/index.mjs"],
      "env": {
        "TASK_CONFIG_PATH": "/absolute/path/to/your/tasks.json"
      }
    }
  }
}
```

## 任务配置格式

您的任务配置文件应遵循以下结构：

```json
{
  "meta": {
    "projectName": "我的项目", // 项目名称（字符串）
    "description": "项目任务管理", // 项目描述（字符串）
    "version": "1.0.0", // 配置版本（字符串）
    "tasksResultOutputDir": "src/task-results" // 任务结果文件存储目录路径（字符串，可选）
  },
  "tasks": [
    {
      "number": 1, // 任务编号（浮点数，如 1、1.1、2.5）- 任务的唯一标识符
      "key": "setup-project", // 任务键（字符串）- 任务的唯一标识符
      "title": "项目设置", // 任务标题（字符串）
      "description": "初始化项目结构", // 任务描述（字符串）- 任务的简要描述
      "status": "pending", // 任务状态（字符串）- 必须是以下之一：pending、done、in-progress、review、deferred、cancelled
      "precondition": [], // 在执行此任务之前必须完成的任务键或编号数组（字符串/数字数组）
      "priority": "high", // 任务优先级（字符串）- 必须是以下之一：low、medium、high
      "details": "", // 附加任务详情（字符串，可选）- 详细说明或任务需求的文件路径
      "result": "", // 任务的预期结果（字符串，可选）
      "testStrategy": "", // 测试此任务的策略（字符串，可选）
      "subtasks": [
        // 子任务数组（数组，可选）
        {
          "number": 1.1, // 子任务编号（浮点数）- 子任务的唯一标识符
          "key": "create-folders", // 子任务键（字符串）- 子任务的唯一标识符
          "title": "创建文件夹结构", // 子任务标题（字符串）
          "description": "设置基本目录结构", // 子任务描述（字符串）- 子任务的简要描述
          "details": "", // 附加子任务详情（字符串，可选）- 详细说明或子任务需求的文件路径
          "status": "pending", // 子任务状态（字符串）- 必须是以下之一：pending、done、in-progress、review、deferred、cancelled
          "precondition": [], // 在执行此子任务之前必须完成的任务/子任务键或编号数组（字符串/数字数组）
          "priority": "high", // 子任务优先级（字符串）- 必须是以下之一：low、medium、high
          "result": "", // 子任务的预期结果（字符串，可选）
          "testStrategy": "" // 测试此子任务的策略（字符串，可选）
        }
      ]
    }
  ]
}
```

### 字段值枚举

- **status**：`pending`、`done`、`in-progress`、`review`、`deferred`、`cancelled`
- **priority**：`low`、`medium`、`high`

### 字段说明

- **description**：任务或子任务的简要描述
- **details**：任务/子任务需求的详细说明或文件路径（支持路径格式以引用外部文档）

## 可用工具

### set_task_status

更新一个或多个任务或子任务的状态。

参数：

- `identifier`：任务键或编号（支持逗号分隔的多个值）
- `status`：新状态（pending|done|in-progress|review|deferred|cancelled）

### next_task

基于优先级和前置条件找到下一个可执行的任务。

返回满足所有依赖关系的最高优先级任务。

### initialize_tasks

通过将所有任务和子任务状态重置为"pending"，结果字段重置为空字符串来初始化项目。

此工具将：
- 将所有任务和子任务的 `status` 字段重置为 `"pending"`
- 将所有任务和子任务的 `result` 字段重置为空字符串 `""`
- 自动保存更新后的配置

无需参数。

## 可用 MCP 提示

### get-task-rules

获取完整的任务管理系统规则和指导原则，支持动态配置替换。

此提示提供任务管理操作的综合文档，自动将配置占位符替换为任务配置文件中的值。

**使用方法**：使用 `/task-manager-mcp:get-task-rules` (MCP) 并根据提供的指令提示执行任务管理操作。

⚠️ **重要提示**：`/task-manager-mcp:get-task-rules` (MCP) 是整个 MCP 系统正常运转的主要入口点。请从这个提示开始，获取所有任务管理操作的全面指导。

## 相关项目

此项目受到 @eyaltoledano 的 [claude-task-master](https://github.com/eyaltoledano/claude-task-master) 启发，后者是一个与 Claude 配合使用的综合 AI 驱动的开发任务管理系统。

### 主要差异

虽然两个项目都专注于 AI 驱动开发的任务管理，但这个 `task-manager-mcp` 项目有不同的范围：

| 功能         | claude-task-master                                       | task-manager-mcp                                |
| ------------ | -------------------------------------------------------- | ----------------------------------------------- |
| **架构**     | 具有 AI 集成的全功能 CLI 工具                            | 专注于协议合规的轻量级 MCP 服务器               |
| **范围**     | 完整的任务管理生态系统，包含 PRD 解析、AI 研究和代码生成 | 核心任务状态跟踪和依赖解析                      |
| **AI 集成**  | 内置支持多个 AI 提供商（Claude、OpenAI、Gemini 等）      | 协议无关，可与任何兼容 MCP 的 AI 客户端配合使用 |
| **依赖关系** | 具有外部 API 依赖的丰富功能集                            | 具有最小依赖的独立部署                          |
| **目标用例** | 端到端项目管理和 AI 辅助开发                             | 集成到现有工作流程中的简单任务跟踪服务          |

### 何时选择哪个

- **选择 claude-task-master**：如果您想要一个完整的 AI 驱动开发工作流程，包含 PRD 解析、研究功能和直接 AI 集成
- **选择 task-manager-mcp**：如果您需要一个轻量级、协议合规的任务管理服务，可集成到您现有的 MCP 设置中

两个项目在 AI 辅助开发工具生态系统中互为补充。

## 许可证

ISC
