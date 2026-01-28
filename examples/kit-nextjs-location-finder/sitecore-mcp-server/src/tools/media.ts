/**
 * MCP Tools for Sitecore Media Library
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { SitecoreClient } from '../sitecore-client.js';

export function createMediaTools(client: SitecoreClient): Tool[] {
  return [
    {
      name: 'sitecore_list_media',
      description: 'List media items in the media library by path. Returns images, documents, and other media files.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Media path (e.g., "/sitecore/media library/Images"). Default is media library root.',
          },
          language: {
            type: 'string',
            description: 'Language code (default: "en")',
          },
        },
      },
    },
    {
      name: 'sitecore_get_media',
      description: 'Get detailed information about a specific media item including metadata and URL.',
      inputSchema: {
        type: 'object',
        properties: {
          itemId: {
            type: 'string',
            description: 'Media item ID (without curly braces)',
          },
          path: {
            type: 'string',
            description: 'Media path (alternative to itemId)',
          },
          language: {
            type: 'string',
            description: 'Language code (default: "en")',
          },
        },
      },
    },
    {
      name: 'sitecore_upload_media',
      description: 'Upload a media file to the Sitecore media library. Supports images, documents, and other file types.',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'File name (e.g., "banner.jpg")',
          },
          parentPath: {
            type: 'string',
            description: 'Parent folder path in media library (e.g., "/sitecore/media library/Images")',
          },
          fileData: {
            type: 'string',
            description: 'Base64 encoded file data',
          },
          mimeType: {
            type: 'string',
            description: 'MIME type (e.g., "image/jpeg", "application/pdf")',
          },
          alt: {
            type: 'string',
            description: 'Alt text for images (optional)',
          },
        },
        required: ['name', 'parentPath', 'fileData', 'mimeType'],
      },
    },
    {
      name: 'sitecore_delete_media',
      description: 'Delete a media item from the media library. WARNING: This action cannot be undone!',
      inputSchema: {
        type: 'object',
        properties: {
          itemId: {
            type: 'string',
            description: 'Media item ID to delete (without curly braces)',
          },
          path: {
            type: 'string',
            description: 'Media path (alternative to itemId)',
          },
        },
      },
    },
  ];
}

export async function handleMediaTool(
  toolName: string,
  args: any,
  client: SitecoreClient
): Promise<any> {
  try {
    switch (toolName) {
      case 'sitecore_list_media': {
        const path = args.path || '/sitecore/media library';
        const items = await client.listItems(path, args.language, true);

        const mediaItems = items.filter(
          (item) =>
            item.templateName?.includes('Media') ||
            item.templateName?.includes('Image') ||
            item.templateName?.includes('File')
        );

        return {
          content: [
            {
              type: 'text',
              text: `📁 Media at ${path}:\n\n${JSON.stringify(
                {
                  path,
                  count: mediaItems.length,
                  items: mediaItems.map((item) => ({
                    id: item.itemId || item.id,
                    name: item.name,
                    templateName: item.templateName,
                    path: item.path,
                    mediaUrl: item.fields?.mediaUrl || `${client.config.instanceUrl}/-/media/${item.id}.ashx`,
                  })),
                },
                null,
                2
              )}`,
            },
          ],
          isError: false,
        };
      }

      case 'sitecore_get_media': {
        if (!args.itemId && !args.path) {
          throw new Error('Either itemId or path must be provided');
        }

        const item = args.itemId
          ? await client.getItem(args.itemId, args.language)
          : await client.getItemByPath(args.path, args.language);

        const mediaUrl = `${client.config.instanceUrl}/-/media/${item.itemId || item.id}.ashx`;

        return {
          content: [
            {
              type: 'text',
              text: `📷 Media Details:\n\n` +
                `Name: ${item.name}\n` +
                `Path: ${item.path}\n` +
                `Template: ${item.templateName}\n` +
                `Media URL: ${mediaUrl}\n\n` +
                `Full Details:\n${JSON.stringify(item, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case 'sitecore_upload_media': {
        if (!args.name) throw new Error('File name is required');
        if (!args.parentPath) throw new Error('Parent path is required');
        if (!args.fileData) throw new Error('File data is required');
        if (!args.mimeType) throw new Error('MIME type is required');

        const mediaItem = await client.uploadMedia({
          name: args.name,
          parentPath: args.parentPath,
          fileData: args.fileData,
          mimeType: args.mimeType,
        });

        const mediaUrl = `${client.config.instanceUrl}/-/media/${mediaItem.itemId || mediaItem.id}.ashx`;

        return {
          content: [
            {
              type: 'text',
              text: `✅ Media "${args.name}" uploaded successfully!\n\n` +
                `📍 Path: ${mediaItem.path}\n` +
                `🆔 ID: ${mediaItem.itemId || mediaItem.id}\n` +
                `🌐 Media URL: ${mediaUrl}\n` +
                `📦 MIME Type: ${args.mimeType}\n\n` +
                `You can now:\n` +
                `- Reference this media in content items\n` +
                `- Publish using: sitecore_publish_item\n` +
                `- Access at: ${mediaUrl}`,
            },
          ],
          isError: false,
        };
      }

      case 'sitecore_delete_media': {
        if (!args.itemId && !args.path) {
          throw new Error('Either itemId or path must be provided');
        }

        const itemId = args.itemId || (await client.getItemByPath(args.path)).itemId;

        await client.deleteItem(itemId);

        return {
          content: [
            {
              type: 'text',
              text: `✅ Media item deleted successfully (ID: ${itemId})`,
            },
          ],
          isError: false,
        };
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

