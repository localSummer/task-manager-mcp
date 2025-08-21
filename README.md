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
npm install task-manager-mcp
# or
npx task-manager-mcp
```

## Configuration

Set the task configuration file path via environment variable:

```bash
export TASK_CONFIG_PATH="/path/to/your/tasks.json"
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
      "subtasks": [ // Array of subtasks (array, optional)
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

## Usage

```bash
# Start the MCP server
export TASK_CONFIG_PATH="/path/to/tasks.json"
npx task-manager-mcp

# Development mode
npm run dev

# Debug with inspector
npm run inspector
```

## License

ISC
