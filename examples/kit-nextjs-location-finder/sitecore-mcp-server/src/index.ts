#!/usr/bin/env node

/**
 * Sitecore MCP Server - Main Entry Point
 * 
 * This server bridges Cursor IDE with Sitecore XM Cloud using the Model Context Protocol.
 * It provides tools, resources, and prompts for managing Sitecore content.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { SitecoreClient } from './sitecore-client.js';
import { createAllTools, handleToolRequest, getToolStats } from './tools/index.js';
import { createAllResources, handleResourceRead, getResourceStats } from './resources/index.js';
import { createAllPrompts, handlePromptGet, getPromptStats } from './prompts/index.js';
import { createLogger } from './utils/logger.js';
import type { SitecoreConfig } from './types/sitecore.js';

const logger = createLogger('MCPServer');

// Load environment variables
dotenv.config();

// Initialize Sitecore client
const sitecoreConfig: SitecoreConfig = {
  instanceUrl: process.env.SITECORE_INSTANCE_URL || '',
  apiKey: process.env.SITECORE_API_KEY,
  clientId: process.env.SITECORE_CLIENT_ID,
  clientSecret: process.env.SITECORE_CLIENT_SECRET,
  oauthTokenUrl: process.env.SITECORE_OAUTH_TOKEN_URL,
  oauthAudience: process.env.SITECORE_OAUTH_AUDIENCE || 'https://api.sitecorecloud.io',
  apiVersion: process.env.SITECORE_API_VERSION || 'v1',
  timeout: process.env.SITECORE_TIMEOUT_MS ? parseInt(process.env.SITECORE_TIMEOUT_MS) : 30000,
};

// Validate configuration
if (!sitecoreConfig.instanceUrl) {
  logger.error('Configuration Error', new Error('SITECORE_INSTANCE_URL is required'));
  console.error('Error: SITECORE_INSTANCE_URL is required');
  process.exit(1);
}

if (!sitecoreConfig.apiKey && (!sitecoreConfig.clientId || !sitecoreConfig.clientSecret)) {
  logger.error('Configuration Error', new Error('Either SITECORE_API_KEY or SITECORE_CLIENT_ID/SECRET must be provided'));
  console.error('Error: Either SITECORE_API_KEY or SITECORE_CLIENT_ID/SECRET must be provided');
  process.exit(1);
}

logger.info('Initializing Sitecore MCP Server', {
  instanceUrl: sitecoreConfig.instanceUrl,
  apiVersion: sitecoreConfig.apiVersion,
});

const sitecoreClient = new SitecoreClient(sitecoreConfig);

// Create MCP server
const server = new Server(
  {
    name: 'sitecore-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// Initialize tools, resources, and prompts
const tools = createAllTools(sitecoreClient);
const resources = createAllResources(sitecoreClient);
const prompts = createAllPrompts(sitecoreClient);

// Log server statistics
const toolStats = getToolStats(sitecoreClient);
const resourceStats = getResourceStats();
const promptStats = getPromptStats();

logger.info('Server initialized with:', {
  tools: toolStats,
  resources: resourceStats,
  prompts: promptStats,
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  logger.debug('Listing all tools', { count: tools.length });
  return {
    tools,
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  logger.info('Tool request', { tool: name, args });

  try {
    const result = await handleToolRequest(name, args || {}, sitecoreClient);
    
    if (result.isError) {
      logger.warn('Tool execution failed', { tool: name, error: result.content[0].text });
    } else {
      logger.info('Tool execution successful', { tool: name });
    }
    
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Tool execution error', error as Error, { tool: name });
    
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  logger.debug('Listing all resources', { count: resources.length });
  return {
    resources,
  };
});

// Handle resource reads
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  logger.info('Resource request', { uri });

  try {
    const result = await handleResourceRead(uri, sitecoreClient);
    logger.info('Resource read successful', { uri });
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Resource read error', error as Error, { uri });
    
    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          text: `❌ Error: ${errorMessage}`,
        },
      ],
    };
  }
});

// List available prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  logger.debug('Listing all prompts', { count: prompts.length });
  return {
    prompts,
  };
});

// Handle prompt get requests
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  logger.info('Prompt request', { prompt: name, args });

  try {
    const result = await handlePromptGet(name, args || {}, sitecoreClient);
    logger.info('Prompt generated successfully', { prompt: name });
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Prompt generation error', error as Error, { prompt: name });
    throw new Error(`Failed to get prompt: ${errorMessage}`);
  }
});

// Start the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    logger.info('Sitecore MCP Server started successfully', {
      transport: 'stdio',
      version: '1.0.0',
      tools: toolStats.total,
      resources: resourceStats.total,
      prompts: promptStats.total,
    });
    
    console.error('✅ Sitecore MCP Server running on stdio');
    console.error(`📊 Tools: ${toolStats.total} | Resources: ${resourceStats.total} | Prompts: ${promptStats.total}`);
  } catch (error) {
    logger.error('Server startup failed', error as Error);
    throw error;
  }
}

main().catch((error) => {
  logger.error('Fatal error', error);
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

