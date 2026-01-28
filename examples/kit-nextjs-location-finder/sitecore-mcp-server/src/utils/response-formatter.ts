/**
 * Response Formatter Utilities
 * Helpers for creating consistent, informative MCP responses
 */

import type { MCPToolResponse } from '../types/mcp.js';

/**
 * Format options for responses
 */
export interface ResponseOptions {
  includeJson?: boolean;
  includeNextSteps?: boolean;
  emoji?: boolean;
}

/**
 * Create a success response with rich formatting
 */
export function createSuccessResponse(
  message: string,
  data?: any,
  options: ResponseOptions = {}
): MCPToolResponse {
  const {
    includeJson = true,
    includeNextSteps = false,
    emoji = true
  } = options;

  let text = emoji ? `✅ ${message}\n\n` : `${message}\n\n`;

  // Add structured data if provided
  if (data && includeJson) {
    text += `${JSON.stringify(data, null, 2)}`;
  }

  return {
    content: [{
      type: 'text',
      text
    }],
    isError: false,
    _meta: data ? { data } : undefined
  };
}

/**
 * Create an error response with helpful information
 */
export function createErrorResponse(
  message: string,
  errorType: 'validation' | 'api' | 'system' = 'system',
  details?: {
    field?: string;
    value?: any;
    suggestion?: string;
  }
): MCPToolResponse {
  let text = `❌ Error: ${message}\n\n`;

  if (details?.field) {
    text += `Field: ${details.field}\n`;
  }

  if (details?.value !== undefined) {
    text += `Value: ${JSON.stringify(details.value)}\n`;
  }

  if (details?.suggestion) {
    text += `\n💡 Suggestion: ${details.suggestion}\n`;
  }

  return {
    content: [{
      type: 'text',
      text
    }],
    isError: true,
    _meta: {
      errorType,
      ...details
    }
  };
}

/**
 * Create a template creation success response
 */
export function createTemplateCreatedResponse(template: {
  templateId?: string;
  id?: string;
  name: string;
  fullName?: string;
  icon?: string;
  fields?: any[];
}): MCPToolResponse {
  const id = template.templateId || template.id;
  
  return {
    content: [{
      type: 'text',
      text: `✅ Template "${template.name}" created successfully!\n\n` +
            `📍 Path: ${template.fullName || 'N/A'}\n` +
            `🆔 ID: ${id}\n` +
            `🎨 Icon: ${template.icon || 'Default'}\n` +
            `📝 Fields: ${template.fields?.length || 0}\n\n` +
            `Next steps:\n` +
            `• View in Content Editor: ${template.fullName}\n` +
            `• Create items: sitecore_create_item templateId="${id}"\n` +
            `• Update template: sitecore_update_template templateId="${id}"\n\n` +
            `Template Details:\n${JSON.stringify(template, null, 2)}`
    }],
    isError: false,
    _meta: { template }
  };
}

/**
 * Create an item creation success response
 */
export function createItemCreatedResponse(item: {
  itemId?: string;
  id?: string;
  name: string;
  path: string;
  templateName?: string;
}): MCPToolResponse {
  const id = item.itemId || item.id;
  
  return {
    content: [{
      type: 'text',
      text: `✅ Item "${item.name}" created successfully!\n\n` +
            `📍 Path: ${item.path}\n` +
            `🆔 ID: ${id}\n` +
            `📝 Template: ${item.templateName || 'N/A'}\n\n` +
            `Next steps:\n` +
            `• View in Content Editor: ${item.path}\n` +
            `• Update fields: sitecore_update_item itemId="${id}"\n` +
            `• Publish: sitecore_publish_item itemId="${id}"\n` +
            `• Move item: sitecore_move_item itemId="${id}"\n\n` +
            `Item Details:\n${JSON.stringify(item, null, 2)}`
    }],
    isError: false,
    _meta: { item }
  };
}

/**
 * Create a list response with summary
 */
export function createListResponse(
  items: any[],
  options: {
    itemName?: string;
    summarize?: boolean;
    limit?: number;
    mapper?: (item: any) => any;
  } = {}
): MCPToolResponse {
  const {
    itemName = 'item',
    summarize = true,
    limit,
    mapper = (item) => item
  } = options;

  const totalCount = items.length;
  const displayItems = limit ? items.slice(0, limit) : items;
  const mappedItems = displayItems.map(mapper);

  let text = `📋 Found ${totalCount} ${itemName}${totalCount !== 1 ? 's' : ''}\n\n`;

  if (limit && totalCount > limit) {
    text += `Showing first ${limit} of ${totalCount}\n\n`;
  }

  if (summarize && totalCount > 0) {
    text += `Summary:\n${JSON.stringify({
      count: totalCount,
      items: mappedItems
    }, null, 2)}`;
  } else {
    text += JSON.stringify(mappedItems, null, 2);
  }

  return {
    content: [{
      type: 'text',
      text
    }],
    isError: false,
    _meta: {
      count: totalCount,
      displayed: mappedItems.length
    }
  };
}

/**
 * Create a deletion success response
 */
export function createDeletionResponse(
  resourceType: string,
  identifier: string
): MCPToolResponse {
  return {
    content: [{
      type: 'text',
      text: `✅ ${resourceType} deleted successfully!\n\n` +
            `Identifier: ${identifier}\n\n` +
            `⚠️  This action cannot be undone.`
    }],
    isError: false,
    _meta: {
      deleted: true,
      resourceType,
      identifier
    }
  };
}

/**
 * Create a publish success response
 */
export function createPublishResponse(options: {
  itemId?: string;
  path?: string;
  deep?: boolean;
  language?: string;
  targets?: string[];
  jobId?: string;
}): MCPToolResponse {
  const mode = options.deep ? 'Deep publish' : 'Single item publish';
  
  return {
    content: [{
      type: 'text',
      text: `✅ Publish operation initiated!\n\n` +
            `📄 Item: ${options.path || options.itemId}\n` +
            `🔄 Mode: ${mode}\n` +
            `🌐 Language: ${options.language || 'en'}\n` +
            `🎯 Targets: ${(options.targets || ['web']).join(', ')}\n` +
            (options.jobId ? `\n🔑 Job ID: ${options.jobId}\n` : '') +
            `\n📊 Status: Queued\n\n` +
            `💡 Use sitecore_get_publish_status to check progress.`
    }],
    isError: false,
    _meta: {
      publish: options
    }
  };
}

/**
 * Create an update success response
 */
export function createUpdateResponse(
  resourceType: string,
  name: string,
  changes: Record<string, any>
): MCPToolResponse {
  const changeList = Object.entries(changes)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `• ${key}: ${JSON.stringify(value)}`)
    .join('\n');

  return {
    content: [{
      type: 'text',
      text: `✅ ${resourceType} "${name}" updated successfully!\n\n` +
            `Changes applied:\n${changeList}\n\n` +
            `💡 Changes are in master database. Use sitecore_publish_item to publish.`
    }],
    isError: false,
    _meta: {
      updated: true,
      resourceType,
      name,
      changes
    }
  };
}

/**
 * Create a validation error response
 */
export function createValidationErrorResponse(error: {
  message: string;
  field?: string;
  value?: any;
}): MCPToolResponse {
  return createErrorResponse(
    error.message,
    'validation',
    {
      field: error.field,
      value: error.value,
      suggestion: 'Please check the field value and try again.'
    }
  );
}

/**
 * Create an API error response
 */
export function createAPIErrorResponse(error: {
  message: string;
  statusCode?: number;
  endpoint?: string;
}): MCPToolResponse {
  let suggestion = 'Please check your request and try again.';
  
  if (error.statusCode === 401) {
    suggestion = 'Authentication failed. Check your credentials.';
  } else if (error.statusCode === 404) {
    suggestion = 'Resource not found. Verify the ID or path.';
  } else if (error.statusCode === 429) {
    suggestion = 'Rate limit exceeded. Please wait and try again.';
  } else if (error.statusCode && error.statusCode >= 500) {
    suggestion = 'Sitecore server error. Please try again later.';
  }

  return createErrorResponse(
    `API Error: ${error.message}`,
    'api',
    {
      suggestion,
      value: { statusCode: error.statusCode, endpoint: error.endpoint }
    }
  );
}

/**
 * Create a progress response (for long operations)
 */
export function createProgressResponse(
  operation: string,
  progress: {
    current: number;
    total: number;
    message?: string;
  }
): MCPToolResponse {
  const percentage = Math.round((progress.current / progress.total) * 100);
  const progressBar = '█'.repeat(Math.floor(percentage / 5)) + 
                      '░'.repeat(20 - Math.floor(percentage / 5));

  return {
    content: [{
      type: 'text',
      text: `⏳ ${operation} in progress...\n\n` +
            `Progress: [${progressBar}] ${percentage}%\n` +
            `${progress.current} of ${progress.total}\n` +
            (progress.message ? `\n${progress.message}` : '')
    }],
    isError: false,
    _meta: {
      progress: {
        percentage,
        current: progress.current,
        total: progress.total
      }
    }
  };
}

/**
 * Format field list for display
 */
export function formatFields(fields: Array<{ name: string; type?: string; value?: any }>): string {
  return fields
    .map((field, idx) => {
      let line = `${idx + 1}. ${field.name}`;
      if (field.type) line += ` (${field.type})`;
      if (field.value !== undefined) line += `: ${field.value}`;
      return line;
    })
    .join('\n');
}

/**
 * Format a path for display
 */
export function formatPath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  return parts.map((part, idx) => {
    const indent = '  '.repeat(idx);
    const icon = idx === parts.length - 1 ? '📄' : '📁';
    return `${indent}${icon} ${part}`;
  }).join('\n');
}

/**
 * Format bytes for display
 */
export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Format duration for display
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(2)}m`;
  return `${(ms / 3600000).toFixed(2)}h`;
}

