# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start the MCP server
npm start

# Development mode with auto-reload
npm run dev

# Debug with MCP inspector
npm run inspector

# Code formatting
npm run format        # Format all files with Prettier
npm run format:check  # Check formatting without making changes
```

## Environment Configuration

The server requires the `TASK_CONFIG_PATH` environment variable to be set to an absolute path pointing to a JSON configuration file:

```bash
export TASK_CONFIG_PATH="/absolute/path/to/tasks.json"
```

## Architecture Overview

This is a Model Context Protocol (MCP) server built with the FastMCP framework for task management. The architecture follows a service-oriented pattern:

### Core Components

- **Server Layer** (`src/server.mjs`): FastMCP server initialization and lifecycle management
- **Tools Layer** (`src/tools/`): MCP tool definitions that expose functionality to clients
- **Prompts Layer** (`src/prompts/`): MCP prompt definitions for task management rules
- **Services Layer** (`src/services/`): Business logic for task operations
- **Configuration Layer** (`src/config.mjs`): Task file loading, validation, and persistence

### Key Architectural Patterns

1. **Tool-Service Separation**: Tools handle MCP protocol concerns while services contain business logic
2. **Configuration-Based Tasks**: Tasks are defined in external JSON files, not hardcoded
3. **Dependency Resolution**: Tasks support preconditions and automatic next-task discovery
4. **Graceful Error Handling**: Silent failures for MCP protocol compliance

### Task Configuration Structure

Tasks are defined in JSON with this hierarchy:

- `meta`: Project metadata (including `tasksResultOutputDir` for task result file storage)
- `tasks[]`: Top-level tasks with status, preconditions, priority
- `subtasks[]`: Nested tasks within parent tasks

### Available MCP Tools

- `set_task_status`: Update task/subtask status (supports comma-separated identifiers)
- `next_task`: Find the next executable task based on dependencies and priority

### Available MCP Prompts

- `get-task-rules`: Retrieves complete task management system rules and guidelines with dynamic configuration replacement

### File Organization

- Entry point: `src/index.mjs` (executable with shebang)
- Server class: `src/server.mjs` (FastMCP server wrapper with lifecycle management)
- Tools registration: `src/tools/index.mjs` aggregates all tool definitions
- Prompts registration: `src/prompts/index.mjs` aggregates all prompt definitions
- Each tool has both definition (`src/tools/`) and implementation (`src/services/`)
- Configuration management: `src/config.mjs` handles JSON file operations and validation
- Shared utilities in respective `utils.mjs` files

### Task Status Values

Valid status values for both tasks and subtasks:

- `pending`: Initial state, ready to be started
- `done`: Completed successfully
- `in-progress`: Currently being worked on
- `review`: Completed but needs review
- `deferred`: Postponed to later
- `cancelled`: No longer needed

### Development Notes

- Uses ES modules (`.mjs` extensions) throughout
- Chinese comments in config.mjs for internationalization
- MCP protocol requires silent error handling (no console output to preserve JSON-RPC)
- Task identifiers support both key strings and numeric IDs
- Graceful shutdown handlers for SIGINT/SIGTERM in index.mjs
- Node.js minimum version: 16 (specified in package.json)
- Prettier is configured for code formatting with devDependencies
- Prompts support dynamic placeholder replacement from configuration files

### Key Configuration Fields

- **description**: Brief description of task/subtask
- **details**: Detailed explanation or file path for requirements (supports path format)
- **tasksResultOutputDir**: Directory path for storing task result files (configurable in meta section)
