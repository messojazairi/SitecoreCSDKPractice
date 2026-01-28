/**
 * MCP-specific type definitions
 */

import { Tool, Resource, Prompt } from '@modelcontextprotocol/sdk/types.js';

/**
 * MCP Tool Response
 */
export interface MCPToolResponse {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
  _meta?: Record<string, any>;
}

/**
 * MCP Tool Handler
 */
export type MCPToolHandler = (
  toolName: string,
  args: Record<string, any>,
  context: any
) => Promise<MCPToolResponse>;

/**
 * MCP Resource Response
 */
export interface MCPResourceResponse {
  contents: Array<{
    uri: string;
    mimeType: string;
    text?: string;
    blob?: string;
  }>;
}

/**
 * MCP Prompt Response
 */
export interface MCPPromptResponse {
  messages: Array<{
    role: 'user' | 'assistant';
    content: {
      type: 'text' | 'image' | 'resource';
      text?: string;
      data?: string;
      mimeType?: string;
    };
  }>;
}

/**
 * Tool Categories
 */
export enum ToolCategory {
  TEMPLATES = 'templates',
  ITEMS = 'items',
  PUBLISHING = 'publishing',
  MEDIA = 'media',
  GRAPHQL = 'graphql',
  SYSTEM = 'system',
  REFERENCES = 'references',
  RENDERING = 'rendering',
}

/**
 * Extended Tool with metadata
 */
export interface ExtendedTool extends Tool {
  category?: ToolCategory;
  tags?: string[];
  examples?: Array<{
    description: string;
    arguments: Record<string, any>;
  }>;
}

/**
 * Extended Resource with metadata
 */
export interface ExtendedResource extends Resource {
  category?: string;
  cacheable?: boolean;
  cachePolicy?: {
    ttl?: number;
    key?: string;
  };
}

/**
 * Extended Prompt with metadata
 */
export interface ExtendedPrompt extends Prompt {
  category?: string;
  tags?: string[];
  complexity?: 'simple' | 'medium' | 'complex';
}

/**
 * Tool Registry
 */
export interface ToolRegistry {
  register(tool: ExtendedTool, handler: MCPToolHandler): void;
  get(name: string): { tool: ExtendedTool; handler: MCPToolHandler } | undefined;
  getAll(): Array<{ tool: ExtendedTool; handler: MCPToolHandler }>;
  getByCategory(category: ToolCategory): Array<{ tool: ExtendedTool; handler: MCPToolHandler }>;
}

/**
 * Resource Registry
 */
export interface ResourceRegistry {
  register(resource: ExtendedResource): void;
  get(uri: string): ExtendedResource | undefined;
  getAll(): ExtendedResource[];
  getByCategory(category: string): ExtendedResource[];
}

/**
 * Prompt Registry
 */
export interface PromptRegistry {
  register(prompt: ExtendedPrompt): void;
  get(name: string): ExtendedPrompt | undefined;
  getAll(): ExtendedPrompt[];
  getByCategory(category: string): ExtendedPrompt[];
}

/**
 * Server Context
 */
export interface ServerContext {
  version: string;
  capabilities: string[];
  startTime: Date;
  requestCount: number;
  errorCount: number;
}

/**
 * Request Context
 */
export interface RequestContext {
  requestId: string;
  timestamp: Date;
  tool?: string;
  resource?: string;
  prompt?: string;
  duration?: number;
}

/**
 * Tool Execution Context
 */
export interface ToolExecutionContext {
  requestContext: RequestContext;
  serverContext: ServerContext;
  cache?: any;
  logger?: any;
}

/**
 * Error Response Types
 */
export interface ValidationErrorResponse extends MCPToolResponse {
  isError: true;
  content: Array<{
    type: 'text';
    text: string;
  }>;
  _meta: {
    errorType: 'validation';
    field?: string;
    value?: any;
  };
}

export interface APIErrorResponse extends MCPToolResponse {
  isError: true;
  content: Array<{
    type: 'text';
    text: string;
  }>;
  _meta: {
    errorType: 'api';
    statusCode?: number;
    endpoint?: string;
  };
}

export interface SystemErrorResponse extends MCPToolResponse {
  isError: true;
  content: Array<{
    type: 'text';
    text: string;
  }>;
  _meta: {
    errorType: 'system';
    stack?: string;
  };
}

/**
 * Success Response Helpers
 */
export function createSuccessResponse(
  message: string,
  data?: any
): MCPToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: message + (data ? `\n\n${JSON.stringify(data, null, 2)}` : ''),
      },
    ],
    isError: false,
    _meta: data ? { data } : undefined,
  };
}

export function createErrorResponse(
  message: string,
  errorType: 'validation' | 'api' | 'system' = 'system',
  meta?: Record<string, any>
): MCPToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: `❌ Error: ${message}`,
      },
    ],
    isError: true,
    _meta: {
      errorType,
      ...meta,
    },
  };
}

/**
 * Tool Argument Types
 */
export interface TemplateToolArgs {
  templateId?: string;
  name?: string;
  parent?: string;
  parentPath?: string;
  language?: string;
  icon?: string;
  sections?: Array<{
    name: string;
    fields?: Array<{
      name: string;
      type: string;
    }>;
  }>;
  fields?: Array<{
    name: string;
    type: string;
  }>;
  baseTemplates?: string[];
}

export interface ItemToolArgs {
  itemId?: string;
  path?: string;
  name?: string;
  templateId?: string;
  parent?: string;
  parentPath?: string;
  targetParentId?: string;
  targetParentPath?: string;
  language?: string;
  fields?: Array<{
    name: string;
    value: string;
  }>;
  includeChildren?: boolean;
}

export interface PublishingToolArgs {
  itemId?: string;
  path?: string;
  rootItemId?: string;
  rootPath?: string;
  language?: string;
  targets?: string[];
  deep?: boolean;
  jobId?: string;
}

export interface MediaToolArgs {
  itemId?: string;
  path?: string;
  name?: string;
  parentPath?: string;
  fileData?: string;
  mimeType?: string;
  alt?: string;
  language?: string;
}

export interface SearchToolArgs {
  templateId?: string;
  templateName?: string;
  nameContains?: string;
  path?: string;
  language?: string;
  limit?: number;
}

export interface ReferenceToolArgs {
  itemId?: string;
  path?: string;
  language?: string;
}

export interface RenderingToolArgs {
  name?: string;
  componentTemplateId?: string;
  componentTemplateName?: string;
  parentPath?: string;
  parentId?: string;
  datasourceTemplate?: string;
  datasourceLocation?: string;
  cacheable?: boolean;
  language?: string;
  // For set_rendering_in_presentation
  pageId?: string;
  pagePath?: string;
  renderingId?: string;
  renderingName?: string;
  placeholder?: string;
  datasourceId?: string;
  datasourcePath?: string;
  renderingParameters?: Record<string, string>;
  device?: string;
}

