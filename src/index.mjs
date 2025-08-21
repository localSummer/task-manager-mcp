#!/usr/bin/env node
import TaskManagerMCPServer from './server.mjs';

/**
 * Start the Task Manager MCP server
 */
async function startServer() {
  const server = new TaskManagerMCPServer();

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    await server.stop();
    process.exit(0);
  });

  // Handle SIGTERM
  process.on('SIGTERM', async () => {
    await server.stop();
    process.exit(0);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    // Silent exit for MCP protocol compliance
    process.exit(1);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    // Silent exit for MCP protocol compliance
    process.exit(1);
  });

  try {
    await server.start();
  } catch (error) {
    // Silent exit for MCP protocol compliance
    process.exit(1);
  }
}

// Start the server
startServer();