/**
 * Creates standard content response for tools
 * @param {string|Object} content - Content to include in response
 * @returns {Object} - Content response object in FastMCP format
 */
export function createContentResponse(content) {
  // FastMCP requires text type, so we format objects as JSON strings
  return {
    content: [
      {
        type: 'text',
        text:
          typeof content === 'object'
            ? // Format JSON nicely with indentation
              JSON.stringify(content, null, 2)
            : // Keep other content types as-is
              String(content),
      },
    ],
  };
}

/**
 * Creates error response for tools
 * @param {string} errorMessage - Error message to include in response
 * @returns {Object} - Error content response object in FastMCP format
 */
export function createErrorResponse(errorMessage) {
  return {
    content: [
      {
        type: 'text',
        text: `Error: ${errorMessage}`,
      },
    ],
    isError: true,
  };
}

/**
 * Handle API result with standardized error handling and response formatting
 * @param {Object} result - Result object from API call with success, data, and error properties
 * @param {Object} log - Logger object
 * @param {string} errorPrefix - Prefix for error messages
 * @returns {Object} - Standardized MCP response object
 */
export function handleApiResult(result, log, errorPrefix = 'API error') {
  if (['error', 'fail'].includes(result.status)) {
    const errorMsg =
      typeof result.error === 'object'
        ? result.error.message
        : result.error || `Unknown ${errorPrefix}`;

    log.error(`${errorPrefix}: ${errorMsg}`);
    return createErrorResponse(errorMsg);
  }

  log.info(`Successfully completed operation.`);

  // Create the response payload
  const responsePayload = {
    data: result.data,
  };

  // Pass this combined payload to createContentResponse
  return createContentResponse(responsePayload);
}
