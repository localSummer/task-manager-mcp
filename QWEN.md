# Project Context for task-manager-mcp

This document provides essential context for understanding and working with the `task-manager-mcp` project.

## Project Overview

This is a Node.js project implementing a lightweight Model Context Protocol (MCP) server for task management. Its core functionalities include:

1.  **Task Status Management**: Allows setting and tracking the status of tasks and their subtasks.
2.  **Smart Task Discovery**: Identifies the next executable task based on defined priorities and dependencies (preconditions).
3.  **Precondition Checking**: Automatically validates if all dependencies for a task are met before suggesting it as the next task.

The server is built using the `fastmcp` framework and communicates via stdio, making it suitable for integration with MCP-compatible clients like Cursor IDE. Task data is managed through external JSON configuration files.

## Key Technologies

*   **Language**: JavaScript (ES Modules)
*   **Runtime**: Node.js (version 16 or higher)
*   **Framework**: `fastmcp`
*   **Validation**: `zod`
*   **Configuration**: External JSON files

## Project Structure

*   `src/`: Contains the main source code.
    *   `index.mjs`: The entry point for the application.
    *   `server.mjs`: Initializes and configures the `FastMCP` server.
    *   `config.mjs`: Handles loading, validating, and saving the task configuration file.
    *   `constant.mjs`: Defines constants used throughout the application (e.g., valid task statuses).
    *   `services/`: Contains the core business logic for task operations (e.g., setting status, finding next task).
    *   `tools/`: Defines and registers the MCP tools (`set_task_status`, `next_task`) that the server exposes to clients.
*   `package.json`: Defines project metadata, dependencies, and NPM scripts.
*   `example-tasks.json`: An example of the task configuration file format.
*   `README.md`: Provides detailed documentation on features, installation, configuration, and usage.

## Building and Running

This project is designed to run directly with Node.js. Ensure you have Node.js >= 16 installed.

1.  **Install Dependencies**: Although the README mentions "No external dependencies", `fastmcp` and `zod` are listed in `package.json`. Run `npm install` to ensure they are present in `node_modules`.
2.  **Set Environment Variable**: Before running, you must set the `TASK_CONFIG_PATH` environment variable to the absolute path of your task configuration JSON file.
    ```bash
    export TASK_CONFIG_PATH="/absolute/path/to/your/tasks.json"
    ```
3.  **Run the Server**:
    *   **Direct Execution**: `node src/index.mjs`
    *   **Using NPM Script**: `npm start`
    *   **Development Mode (with fastmcp dev)**: `npm run dev`
    *   **With MCP Inspector**: `npm run inspector`

## Development Conventions

*   **Modules**: Uses ES Modules (`.mjs` extension).
*   **Entry Point**: The main entry point is `src/index.mjs`.
*   **Configuration**: Relies on an external JSON file specified by the `TASK_CONFIG_PATH` environment variable. The structure of this file is defined in `example-tasks.json`.
*   **MCP Tools**: Tools are defined in `src/tools/` and registered with the server in `src/tools/index.mjs`. Each tool has a `register` function and uses a corresponding `service` function from `src/services/`.
*   **Error Handling**: The server handles errors gracefully, often exiting silently to comply with the MCP protocol.
*   **Logging**: Context-aware logging is available within tool execution functions.