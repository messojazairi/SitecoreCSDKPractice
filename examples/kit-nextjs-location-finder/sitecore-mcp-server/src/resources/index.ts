/**
 * Resources Aggregator - Centralized export of all MCP resources
 */

import { Resource } from '@modelcontextprotocol/sdk/types.js';
import type { SitecoreClient } from '../sitecore-client.js';
import type { MCPResourceResponse } from '../types/mcp.js';

/**
 * Create all resources
 */
export function createAllResources(client: SitecoreClient): Resource[] {
  return [
    {
      uri: 'sitecore://templates',
      name: 'Sitecore Templates',
      description: 'List of all Sitecore templates available in the system',
      mimeType: 'application/json',
    },
    {
      uri: 'sitecore://templates/{id}',
      name: 'Template Details',
      description: 'Detailed information about a specific template (use template ID)',
      mimeType: 'application/json',
    },
    {
      uri: 'sitecore://content',
      name: 'Content Tree Root',
      description: 'Root of the Sitecore content tree',
      mimeType: 'application/json',
    },
    {
      uri: 'sitecore://content/{path}',
      name: 'Content by Path',
      description: 'Content items at a specific path (e.g., sitecore://content/Home)',
      mimeType: 'application/json',
    },
    {
      uri: 'sitecore://items/{id}',
      name: 'Item by ID',
      description: 'Detailed information about a specific item by ID',
      mimeType: 'application/json',
    },
    {
      uri: 'sitecore://media',
      name: 'Media Library',
      description: 'Media library root with all media items',
      mimeType: 'application/json',
    },
    {
      uri: 'sitecore://system/info',
      name: 'System Information',
      description: 'Sitecore instance and system information',
      mimeType: 'application/json',
    },
  ];
}

/**
 * Handle resource read requests
 */
export async function handleResourceRead(
  uri: string,
  client: SitecoreClient
): Promise<{ contents: Array<{ uri: string; mimeType: string; text: string }> }> {
  try {
    // Handle templates list
    if (uri === 'sitecore://templates') {
      const templates = await client.getTemplates();
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                count: templates.length,
                templates: templates.map((t) => ({
                  id: t.templateId || t.id,
                  name: t.name,
                  fullName: t.fullName,
                  icon: t.icon,
                  fieldCount: t.fields?.length || 0,
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // Handle specific template
    if (uri.startsWith('sitecore://templates/')) {
      const templateIdOrName = uri.replace('sitecore://templates/', '');
      try {
        const template = await client.getTemplate(templateIdOrName);
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(template, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          contents: [
            {
              uri,
              mimeType: 'text/plain',
              text: `Error retrieving template "${templateIdOrName}": ${errorMessage}`,
            },
          ],
        };
      }
    }

    // Handle content root
    if (uri === 'sitecore://content') {
      const items = await client.listItems('/sitecore/content', 'en', true);
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                path: '/sitecore/content',
                count: items.length,
                items: items.map((item) => ({
                  id: item.itemId || item.id,
                  name: item.name,
                  path: item.path,
                  templateName: item.templateName,
                  hasChildren: item.hasChildren,
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // Handle content by path
    if (uri.startsWith('sitecore://content/')) {
      const path = '/sitecore/content/' + uri.replace('sitecore://content/', '');
      const items = await client.listItems(path, 'en', true);
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                path,
                count: items.length,
                items: items.map((item) => ({
                  id: item.itemId || item.id,
                  name: item.name,
                  path: item.path,
                  templateName: item.templateName,
                  hasChildren: item.hasChildren,
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // Handle item by ID
    if (uri.startsWith('sitecore://items/')) {
      const itemId = uri.replace('sitecore://items/', '');
      const item = await client.getItem(itemId, 'en');
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(item, null, 2),
          },
        ],
      };
    }

    // Handle media library
    if (uri === 'sitecore://media') {
      const items = await client.listItems('/sitecore/media library', 'en', true);
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                path: '/sitecore/media library',
                count: items.length,
                items: items.map((item) => ({
                  id: item.itemId || item.id,
                  name: item.name,
                  path: item.path,
                  templateName: item.templateName,
                  mediaUrl: `${client.config.instanceUrl}/-/media/${item.itemId || item.id}.ashx`,
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // Handle system info
    if (uri === 'sitecore://system/info') {
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(
              {
                instanceUrl: client.config.instanceUrl,
                apiVersion: client.config.apiVersion || 'v1',
                authenticated: true,
                capabilities: [
                  'Templates Management',
                  'Content Management',
                  'Publishing',
                  'Media Library',
                  'GraphQL Authoring API',
                ],
              },
              null,
              2
            ),
          },
        ],
      };
    }

    throw new Error(`Unknown resource: ${uri}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          text: `Error reading resource: ${errorMessage}`,
        },
      ],
    };
  }
}

/**
 * Get resource categories
 */
export function getResourceCategories(): string[] {
  return ['templates', 'content', 'media', 'system'];
}

/**
 * Get resources by category
 */
export function getResourcesByCategory(
  category: string,
  client: SitecoreClient
): Resource[] {
  const allResources = createAllResources(client);
  
  switch (category) {
    case 'templates':
      return allResources.filter(r => r.uri.startsWith('sitecore://templates'));
    case 'content':
      return allResources.filter(r => r.uri.startsWith('sitecore://content') || r.uri.startsWith('sitecore://items'));
    case 'media':
      return allResources.filter(r => r.uri.startsWith('sitecore://media'));
    case 'system':
      return allResources.filter(r => r.uri.startsWith('sitecore://system'));
    default:
      return [];
  }
}

/**
 * Get resource count
 */
export function getResourceStats(): Record<string, number> {
  return {
    templates: 2,
    content: 3,
    media: 1,
    system: 1,
    total: 7,
  };
}

// Export for backward compatibility
export { createAllResources as createResources };

