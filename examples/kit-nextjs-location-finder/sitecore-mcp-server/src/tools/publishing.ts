/**
 * MCP Tools for Sitecore Publishing
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { SitecoreClient } from '../sitecore-client.js';

export function createPublishingTools(client: SitecoreClient): Tool[] {
  return [
    {
      name: 'sitecore_publish_item',
      description: 'Publish a single content item to the target database (typically "web"). Optionally publish descendants. You can provide either an itemId (GUID) or a path (e.g., "/sitecore/content/MySite/Home/Data/Item"). Paths are preferred when you have the full Sitecore content path.',
      inputSchema: {
        type: 'object',
        properties: {
          itemId: {
            type: 'string',
            description: 'Item ID (GUID) to publish. Can be provided with or without curly braces. Example: "12345678-1234-1234-1234-123456789012" or "{12345678-1234-1234-1234-123456789012}"',
          },
          path: {
            type: 'string',
            description: 'Full Sitecore item path to publish. This is the preferred method when you have the content path. Example: "/sitecore/content/MySite/Home/Data/Accordion 5" or "/sitecore/content/ai-content-sdk/hztlaicontentsdk/Home/Data/Home Page Accordion/Accordion 5". Either itemId or path must be provided.',
          },
          language: {
            type: 'string',
            description: 'Language to publish (default: "en")',
          },
          targets: {
            type: 'array',
            description: 'Target databases (default: ["web"])',
            items: {
              type: 'string',
            },
          },
          deep: {
            type: 'boolean',
            description: 'Publish descendants (deep publish). Default: false',
          },
        },
      },
    },
    {
      name: 'sitecore_publish_tree',
      description: 'Publish an entire content tree starting from a root item. Publishes all descendants. You can provide either a rootItemId (GUID) or a rootPath (e.g., "/sitecore/content/MySite"). Paths are preferred when you have the full Sitecore content path.',
      inputSchema: {
        type: 'object',
        properties: {
          rootItemId: {
            type: 'string',
            description: 'Root item ID (GUID) to publish tree from. Can be provided with or without curly braces. Example: "12345678-1234-1234-1234-123456789012"',
          },
          rootPath: {
            type: 'string',
            description: 'Full Sitecore root path to publish tree from. This is the preferred method when you have the content path. Example: "/sitecore/content/MySite" or "/sitecore/content/ai-content-sdk/hztlaicontentsdk/Home". Either rootItemId or rootPath must be provided.',
          },
          language: {
            type: 'string',
            description: 'Language to publish (default: "en")',
          },
          targets: {
            type: 'array',
            description: 'Target databases (default: ["web"])',
            items: {
              type: 'string',
            },
          },
        },
      },
    },
    {
      name: 'sitecore_get_publish_status',
      description: 'Check the status of publishing operations. Shows active and recent publish jobs.',
      inputSchema: {
        type: 'object',
        properties: {
          jobId: {
            type: 'string',
            description: 'Specific job ID to check (optional)',
          },
        },
      },
    },
  ];
}

export async function handlePublishingTool(
  toolName: string,
  args: any,
  client: SitecoreClient
): Promise<any> {
  try {
    switch (toolName) {
      case 'sitecore_publish_item': {
        if (!args.itemId && !args.path) {
          throw new Error('Either itemId or path must be provided');
        }

        // Resolve itemId from path if needed
        let itemId: string;
        if (args.path) {
          // Trim and validate path
          const path = args.path.trim();
          if (!path.startsWith('/sitecore/')) {
            throw new Error(`Invalid path format. Path must start with "/sitecore/". Provided: "${path}"`);
          }
          try {
            const item = await client.getItemByPath(path, args.language || 'en');
            itemId = item.itemId || item.id;
            if (!itemId) {
              throw new Error(`Item found at path "${path}" but has no itemId`);
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to resolve item at path "${path}": ${errorMessage}`);
          }
        } else {
          itemId = args.itemId;
        }

        const result = await client.publishItem({
          itemId,
          language: args.language || 'en',
          targets: args.targets || ['web'],
          deep: args.deep || false,
        });

        return {
          content: [
            {
              type: 'text',
              text: `✅ Item publish ${args.deep ? '(deep)' : ''} initiated!\n\n` +
                `${args.path ? `📁 Path: ${args.path}\n` : ''}` +
                `📄 Item ID: ${itemId}\n` +
                `🌐 Language: ${args.language || 'en'}\n` +
                `🎯 Targets: ${(args.targets || ['web']).join(', ')}\n` +
                `🔄 Mode: ${args.deep ? 'Deep (with descendants)' : 'Single item'}\n\n` +
                `${result.operationId ? `Operation ID: ${result.operationId}\n` : ''}` +
                `${result.jobId ? `Job ID: ${result.jobId}\n` : ''}` +
                `Status: ${result.status || 'Queued'}\n\n` +
                `Use sitecore_get_publish_status to check progress.`,
            },
          ],
          isError: false,
        };
      }

      case 'sitecore_publish_tree': {
        if (!args.rootItemId && !args.rootPath) {
          throw new Error('Either rootItemId or rootPath must be provided');
        }

        // Resolve rootItemId from path if needed
        let rootItemId: string;
        if (args.rootPath) {
          // Trim and validate path
          const rootPath = args.rootPath.trim();
          if (!rootPath.startsWith('/sitecore/')) {
            throw new Error(`Invalid path format. Path must start with "/sitecore/". Provided: "${rootPath}"`);
          }
          try {
            const item = await client.getItemByPath(rootPath, args.language || 'en');
            rootItemId = item.itemId || item.id;
            if (!rootItemId) {
              throw new Error(`Item found at path "${rootPath}" but has no itemId`);
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to resolve item at path "${rootPath}": ${errorMessage}`);
          }
        } else {
          rootItemId = args.rootItemId;
        }

        const result = await client.publishTree({
          rootItemId,
          language: args.language || 'en',
          targets: args.targets || ['web'],
        });

        return {
          content: [
            {
              type: 'text',
              text: `✅ Tree publish initiated!\n\n` +
                `${args.rootPath ? `📁 Root Path: ${args.rootPath}\n` : ''}` +
                `🌳 Root Item ID: ${rootItemId}\n` +
                `🌐 Language: ${args.language || 'en'}\n` +
                `🎯 Targets: ${(args.targets || ['web']).join(', ')}\n\n` +
                `${result.operationId ? `Operation ID: ${result.operationId}\n` : ''}` +
                `${result.jobId ? `Job ID: ${result.jobId}\n` : ''}` +
                `Status: ${result.status || 'Queued'}\n\n` +
                `⚠️  This may take several minutes for large content trees.\n` +
                `Use sitecore_get_publish_status to check progress.`,
            },
          ],
          isError: false,
        };
      }

      case 'sitecore_get_publish_status': {
        const status = await client.getPublishStatus(args.jobId);

        if (args.jobId) {
          return {
            content: [
              {
                type: 'text',
                text: `📊 Publish Job Status:\n\n${JSON.stringify(status, null, 2)}`,
              },
            ],
            isError: false,
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `📊 Publishing Status:\n\n` +
                  `Active Jobs: ${status.activeJobs || 0}\n` +
                  `Queued Jobs: ${status.queuedJobs || 0}\n\n` +
                  `${JSON.stringify(status, null, 2)}`,
              },
            ],
            isError: false,
          };
        }
      }

      default:
        throw new Error(`Unknown tool: ${toolName}`);
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
    };
  }
}

