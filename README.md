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
    "projectName": "My Project",
    "description": "Project task management",
    "version": "1.0.0"
  },
  "tasks": [
    {
      "number": 1,
      "key": "setup-project",
      "title": "Project Setup",
      "description": "Initialize project structure",
      "status": "pending",
      "precondition": [],
      "priority": "high",
      "subtasks": [
        {
          "number": 1.1,
          "key": "create-folders",
          "title": "Create Folder Structure",
          "status": "pending",
          "precondition": []
        }
      ]
    }
  ]
}
```

## Available Tools

### set_task_status
Update the status of one or more tasks or subtasks.

Parameters:
- `identifier`: Task key or number (supports comma-separated multiple values)
- `status`: New status (pending|done|in-progress|review|deferred|cancelled)

### next_task
Find the next executable task based on priorities and preconditions.

Returns the highest priority task that has all dependencies satisfied.

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