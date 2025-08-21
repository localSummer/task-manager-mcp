# task-manager-mcp

A lightweight MCP (Model Context Protocol) server for task management with intelligent status tracking and next task discovery based on preconditions.

## Features

- **Task Status Management**: Set and track task status with support for subtasks
- **Smart Task Discovery**: Find the next executable task based on priorities and dependencies
- **Precondition Checking**: Automatic validation of task dependencies before execution
- **Flexible Configuration**: Configure via task JSON files with customizable structure
- **Standalone**: No external dependencies, ready for independent deployment

## Installation

```bash
git clone https://github.com/localSummer/task-manager-mcp.git
```

## MCP Client Configuration

### Cursor IDE Configuration

Add the following configuration to your `.cursor/mcp.json` file:

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

## Task Configuration Format

Your task configuration file should follow this structure:

```json
{
  "meta": {
    "projectName": "My Project", // Project name (string)
    "description": "Project task management", // Project description (string)
    "version": "1.0.0" // Configuration version (string)
  },
  "tasks": [
    {
      "number": 1, // Task number (float, e.g., 1, 1.1, 2.5) - Unique identifier for the task
      "key": "setup-project", // Task key (string) - Unique identifier for the task
      "title": "Project Setup", // Task title (string)
      "description": "Initialize project structure", // Task description (string)
      "status": "pending", // Task status (string) - Must be one of: pending, done, in-progress, review, deferred, cancelled
      "precondition": [], // Array of task keys or numbers that must be completed before this task can be executed (array of strings/numbers)
      "priority": "high", // Task priority (string) - Must be one of: low, medium, high
      "details": "", // Additional task details (string, optional)
      "result": "", // Expected result of the task (string, optional)
      "testStrategy": "", // Strategy for testing this task (string, optional)
      "subtasks": [
        // Array of subtasks (array, optional)
        {
          "number": 1.1, // Subtask number (float) - Unique identifier for the subtask
          "key": "create-folders", // Subtask key (string) - Unique identifier for the subtask
          "title": "Create Folder Structure", // Subtask title (string)
          "description": "Set up the basic directory structure", // Subtask description (string)
          "details": "", // Additional subtask details (string, optional)
          "status": "pending", // Subtask status (string) - Must be one of: pending, done, in-progress, review, deferred, cancelled
          "precondition": [], // Array of task/subtask keys or numbers that must be completed before this subtask can be executed (array of strings/numbers)
          "priority": "high", // Subtask priority (string) - Must be one of: low, medium, high
          "result": "", // Expected result of the subtask (string, optional)
          "testStrategy": "" // Strategy for testing this subtask (string, optional)
        }
      ]
    }
  ]
}
```

### Field Value Enumerations

- **status**: `pending`, `done`, `in-progress`, `review`, `deferred`, `cancelled`
- **priority**: `low`, `medium`, `high`

## Available Tools

### set_task_status

Update the status of one or more tasks or subtasks.

Parameters:

- `identifier`: Task key or number (supports comma-separated multiple values)
- `status`: New status (pending|done|in-progress|review|deferred|cancelled)

### next_task

Find the next executable task based on priorities and preconditions.

Returns the highest priority task that has all dependencies satisfied.

## Related Projects

This project draws inspiration from [claude-task-master](https://github.com/eyaltoledano/claude-task-master) by @eyaltoledano, a comprehensive AI-powered task management system for development with Claude.

### Key Differences

While both projects focus on task management for AI-driven development, this `task-manager-mcp` project has a different scope:

| Feature             | claude-task-master                                                                    | task-manager-mcp                                                     |
| ------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Architecture**    | Full-featured CLI tool with AI integration                                            | Lightweight MCP server focused on protocol compliance                |
| **Scope**           | Complete task management ecosystem with PRD parsing, AI research, and code generation | Core task status tracking and dependency resolution                  |
| **AI Integration**  | Built-in support for multiple AI providers (Claude, OpenAI, Gemini, etc.)             | Protocol-agnostic, works with any MCP-compatible AI client           |
| **Dependencies**    | Rich feature set with external API dependencies                                       | Standalone with minimal dependencies                                 |
| **Target Use Case** | End-to-end project management and AI-assisted development                             | Simple task tracking service for integration into existing workflows |

### When to Choose Which

- **Choose claude-task-master** if you want a complete AI-powered development workflow with PRD parsing, research capabilities, and direct AI integration
- **Choose task-manager-mcp** if you need a lightweight, protocol-compliant task management service that integrates with your existing MCP setup

Both projects complement each other in the ecosystem of AI-assisted development tools.

## License

ISC
