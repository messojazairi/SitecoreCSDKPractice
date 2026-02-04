/**
 * Tools Aggregator - Centralized export of all MCP tools
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { SitecoreClient } from '../sitecore-client.js';
import type { MCPToolResponse, ToolCategory } from '../types/mcp.js';

// Import individual tool modules
import { createTemplateTools, handleTemplateTool } from './templates.js';
import { createItemTools, handleItemTool } from './items.js';
import { createPublishingTools, handlePublishingTool } from './publishing.js';
import { createMediaTools, handleMediaTool } from './media.js';
import { createGraphQLTools, handleGraphQLTool } from './graphql.js';
import { createSystemTools, handleSystemTool } from './system.js';
import { createReferenceTools, handleReferenceTool } from './references.js';
import { createRenderingTools, handleRenderingTool } from './rendering.js';
import { createDesignAnalyzerTools, handleDesignAnalyzerTool } from './design-analyzer.js';

/**
 * Create all tools
 */
export function createAllTools(client: SitecoreClient): Tool[] {
  return [
    ...createTemplateTools(client),
    ...createItemTools(client),
    ...createPublishingTools(client),
    ...createMediaTools(client),
    ...createGraphQLTools(client),
    ...createSystemTools(client),
    ...createReferenceTools(client),
    ...createRenderingTools(client),
    ...createDesignAnalyzerTools(client),
  ];
}

/**
 * Get tools by category
 */
export function getToolsByCategory(
  client: SitecoreClient,
  category: ToolCategory
): Tool[] {
  switch (category) {
    case 'templates':
      return createTemplateTools(client);
    case 'items':
      return createItemTools(client);
    case 'publishing':
      return createPublishingTools(client);
    case 'media':
      return createMediaTools(client);
    case 'graphql':
      return createGraphQLTools(client);
    case 'system':
      return createSystemTools(client);
    case 'references':
      return createReferenceTools(client);
    case 'rendering':
      return createRenderingTools(client);
    case 'design':
      return createDesignAnalyzerTools(client);
    default:
      return [];
  }
}

/**
 * Route tool requests to appropriate handler
 */
export async function handleToolRequest(
  toolName: string,
  args: Record<string, any>,
  client: SitecoreClient
): Promise<MCPToolResponse> {
  try {
    // Determine tool category and route to handler
    if (toolName.includes('analyze') || toolName.includes('field_types') || toolName.includes('suggest_fields') || toolName.includes('generate_template_from')) {
      return await handleDesignAnalyzerTool(toolName, args, client);
    } else if (toolName.includes('validate_item') || toolName.includes('suggest_folder')) {
      // Best practices validation tools - route to item handler
      return await handleItemTool(toolName, args, client);
    } else if (toolName.includes('template')) {
      return await handleTemplateTool(toolName, args, client);
    } else if (toolName.includes('rendering') || toolName.includes('presentation')) {
      return await handleRenderingTool(toolName, args, client);
    } else if (toolName.includes('publish')) {
      return await handlePublishingTool(toolName, args, client);
    } else if (toolName.includes('media')) {
      return await handleMediaTool(toolName, args, client);
    } else if (toolName.includes('graphql') || toolName.includes('introspect')) {
      return await handleGraphQLTool(toolName, args, client);
    } else if (toolName.includes('language') || toolName.includes('system')) {
      return await handleSystemTool(toolName, args, client);
    } else if (toolName.includes('reference') || toolName.includes('referrer')) {
      return await handleReferenceTool(toolName, args, client);
    } else {
      // Default to item tools
      return await handleItemTool(toolName, args, client);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error in ${toolName}:\n\n${errorMessage}`,
        },
      ],
      isError: true,
      _meta: {
        errorType: 'system',
        tool: toolName,
      },
    };
  }
}

/**
 * Get tool count by category
 */
export function getToolStats(client: SitecoreClient): Record<string, number> {
  return {
    templates: createTemplateTools(client).length,
    items: createItemTools(client).length,
    publishing: createPublishingTools(client).length,
    media: createMediaTools(client).length,
    graphql: createGraphQLTools(client).length,
    system: createSystemTools(client).length,
    references: createReferenceTools(client).length,
    rendering: createRenderingTools(client).length,
    design: createDesignAnalyzerTools(client).length,
    total: createAllTools(client).length,
  };
}

/**
 * Export individual tool creators for direct access
 */
export {
  createTemplateTools,
  handleTemplateTool,
  createItemTools,
  handleItemTool,
  createPublishingTools,
  handlePublishingTool,
  createMediaTools,
  handleMediaTool,
  createGraphQLTools,
  handleGraphQLTool,
  createSystemTools,
  handleSystemTool,
  createReferenceTools,
  handleReferenceTool,
  createRenderingTools,
  handleRenderingTool,
  createDesignAnalyzerTools,
  handleDesignAnalyzerTool,
};

