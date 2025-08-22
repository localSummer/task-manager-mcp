import { FastMCP } from 'fastmcp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { registerAllTools } from './tools/index.mjs';
import { registerAllPrompts } from './prompts/index.mjs';
import { validateConfigFile, getTaskConfigPath } from './config.mjs';

// Constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Task Manager MCP Server
 */
class TaskManagerMCPServer {
  constructor() {
    this.server = null;
  }

  /**
   * Start the MCP server
   */
  async start() {
    try {
      // Validate configuration before starting
      this.validateConfiguration();

      // Get version from package.json using synchronous fs
      const packagePath = path.join(__dirname, '../package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      // Create FastMCP server instance
      this.server = new FastMCP({
        name: 'task-manager-mcp',
        version: packageJson.version,
      });

      // Register all tools
      registerAllTools(this.server);

      // Register all prompts
      registerAllPrompts(this.server);

      await this.server.start({
        transportType: 'stdio',
        timeout: 120000,
      });

      return this.server;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Stop the MCP server
   */
  async stop() {
    if (this.server) {
      // Clean shutdown without console output for MCP protocol
      await this.server.close?.();
    }
  }

  /**
   * Validate the server configuration
   */
  validateConfiguration() {
    try {
      const configPath = getTaskConfigPath();

      if (!validateConfigFile(configPath)) {
        throw new Error(
          `Task configuration file not found or invalid: ${configPath}\n` +
            'Please ensure the TASK_CONFIG_PATH environment variable points to a valid JSON file.'
        );
      }

      // Configuration validation passed - no output needed
    } catch (error) {
      // Don't output to console in MCP mode - just throw the error
      throw error;
    }
  }
}

export default TaskManagerMCPServer;
