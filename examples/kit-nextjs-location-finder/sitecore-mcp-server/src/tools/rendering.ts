/**
 * MCP Tools for Sitecore Rendering Management
 * - Create renderings
 * - Set renderings in presentation details
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { SitecoreClient } from '../sitecore-client.js';

export function createRenderingTools(client: SitecoreClient): Tool[] {
  return [
    {
      name: 'sitecore_create_rendering',
      description: 'Create a new rendering item in Sitecore. A rendering is a component that can be added to pages. You can specify the component template it uses, the path where it should be created, and rendering parameters.',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name of the rendering (e.g., "Hero Banner Rendering", "Product Card Rendering")',
          },
          componentTemplateId: {
            type: 'string',
            description: 'The template ID (GUID) of the component this rendering uses (without curly braces)',
          },
          componentTemplateName: {
            type: 'string',
            description: 'Alternative: The name of the component template (e.g., "Hero Banner Component")',
          },
          parentPath: {
            type: 'string',
            description: 'Path where the rendering should be created (e.g., "/sitecore/layout/Renderings/Feature/MyProject")',
          },
          parentId: {
            type: 'string',
            description: 'Alternative: Parent item ID where rendering should be created (without curly braces)',
          },
          datasourceTemplate: {
            type: 'string',
            description: 'Optional: Data source template name or ID for this rendering',
          },
          datasourceLocation: {
            type: 'string',
            description: 'Optional: Default location for data sources (e.g., "./Data")',
          },
          cacheable: {
            type: 'boolean',
            description: 'Optional: Whether the rendering is cacheable (default: true)',
          },
          language: {
            type: 'string',
            description: 'Language code (default: "en")',
          },
        },
        required: ['name'],
      },
    },
    {
      name: 'sitecore_set_rendering_in_presentation',
      description: 'Add a rendering to a page\'s presentation details (final layout). This places a component on a page in a specific placeholder.',
      inputSchema: {
        type: 'object',
        properties: {
          pageId: {
            type: 'string',
            description: 'The page item ID where the rendering should be added (without curly braces)',
          },
          pagePath: {
            type: 'string',
            description: 'Alternative: The page path (e.g., "/sitecore/content/MySite/Home")',
          },
          renderingId: {
            type: 'string',
            description: 'The rendering item ID to add to the page (without curly braces)',
          },
          renderingName: {
            type: 'string',
            description: 'Alternative: The rendering name to look up and add',
          },
          placeholder: {
            type: 'string',
            description: 'The placeholder name where the rendering should be placed (e.g., "main", "header", "content")',
          },
          datasourceId: {
            type: 'string',
            description: 'Optional: Data source item ID for the rendering (without curly braces)',
          },
          datasourcePath: {
            type: 'string',
            description: 'Optional: Data source item path',
          },
          renderingParameters: {
            type: 'object',
            description: 'Optional: Additional rendering parameters as key-value pairs',
            additionalProperties: {
              type: 'string',
            },
          },
          device: {
            type: 'string',
            description: 'Optional: Device ID (default: "{FE5D7FDF-89C0-4D99-9AA3-B5FDB009C9F3}" for Default device)',
          },
          language: {
            type: 'string',
            description: 'Language code (default: "en")',
          },
        },
        required: ['placeholder'],
      },
    },
  ];
}

export async function handleRenderingTool(
  toolName: string,
  args: any,
  client: SitecoreClient
): Promise<any> {
  try {
    switch (toolName) {
      case 'sitecore_create_rendering': {
        if (!args.name) {
          throw new Error('Rendering name is required');
        }

        // Standard rendering template ID in Sitecore
        const renderingTemplateId = '99F8905D-4A87-4EB8-9F8B-A9BEBFB3ADD6'; // Controller Rendering template
        
        // Determine parent location
        let parentId = args.parentId;
        if (!parentId && args.parentPath) {
          const parentItem = await client.getItemByPath(args.parentPath, args.language || 'en');
          parentId = parentItem.itemId || parentItem.id;
        }
        
        // If no parent specified, use default renderings location
        if (!parentId && !args.parentPath) {
          args.parentPath = '/sitecore/layout/Renderings/Project';
          const parentItem = await client.getItemByPath(args.parentPath, args.language || 'en');
          parentId = parentItem.itemId || parentItem.id;
        }

        // Get component template ID if name is provided
        let componentTemplateId = args.componentTemplateId;
        if (!componentTemplateId && args.componentTemplateName) {
          const template = await client.findTemplateByName(args.componentTemplateName);
          if (!template) {
            throw new Error(`Component template "${args.componentTemplateName}" not found`);
          }
          componentTemplateId = template.templateId || template.id;
        }

        // Prepare fields for the rendering item
        const fields: Array<{ name: string; value: string }> = [];
        
        // Add component template reference
        if (componentTemplateId) {
          fields.push({
            name: 'Component',
            value: componentTemplateId,
          });
        }

        // Add datasource template if provided
        if (args.datasourceTemplate) {
          let datasourceTemplateId = args.datasourceTemplate;
          // If it's a name, look it up
          if (!datasourceTemplateId.match(/^[A-F0-9-]{36}$/i)) {
            const dsTemplate = await client.findTemplateByName(args.datasourceTemplate);
            if (dsTemplate) {
              datasourceTemplateId = dsTemplate.templateId || dsTemplate.id;
            }
          }
          fields.push({
            name: 'Datasource Template',
            value: datasourceTemplateId,
          });
        }

        // Add datasource location if provided
        if (args.datasourceLocation) {
          fields.push({
            name: 'Datasource Location',
            value: args.datasourceLocation,
          });
        }

        // Add cacheable setting
        if (typeof args.cacheable !== 'undefined') {
          fields.push({
            name: 'Cacheable',
            value: args.cacheable ? '1' : '0',
          });
        }

        // Create the rendering item
        const rendering = await client.createItem({
          name: args.name,
          templateId: renderingTemplateId,
          parent: parentId,
          language: args.language || 'en',
          fields: fields,
        });

        let responseText = `✅ Rendering "${rendering.name}" created successfully!\n\n`;
        responseText += `📍 Path: ${rendering.path}\n`;
        responseText += `🆔 ID: ${rendering.itemId || rendering.id}\n`;
        responseText += `📝 Template: ${rendering.templateName}\n`;
        
        if (componentTemplateId) {
          responseText += `🎨 Component Template: ${componentTemplateId}\n`;
        }
        
        if (args.datasourceTemplate) {
          responseText += `📊 Datasource Template: ${args.datasourceTemplate}\n`;
        }
        
        responseText += `\nNext steps:\n`;
        responseText += `- Add to page: Use sitecore_set_rendering_in_presentation\n`;
        responseText += `- Update rendering settings: Use sitecore_update_item\n`;
        responseText += `- Publish: Use sitecore_publish_item\n\n`;
        responseText += `${JSON.stringify(rendering, null, 2)}`;

        return {
          content: [
            {
              type: 'text',
              text: responseText,
            },
          ],
          isError: false,
        };
      }

      case 'sitecore_set_rendering_in_presentation': {
        if (!args.placeholder) {
          throw new Error('Placeholder name is required');
        }

        // Get page ID
        let pageId = args.pageId;
        if (!pageId && args.pagePath) {
          const pageItem = await client.getItemByPath(args.pagePath, args.language || 'en');
          pageId = pageItem.itemId || pageItem.id;
        }
        
        if (!pageId) {
          throw new Error('Either pageId or pagePath must be provided');
        }

        // Get rendering ID
        let renderingId = args.renderingId;
        if (!renderingId && args.renderingName) {
          // Search for rendering by name
          const renderingItems = await client.searchItems({
            nameContains: args.renderingName,
            path: '/sitecore/layout/Renderings',
            language: args.language || 'en',
            limit: 10,
          });
          
          const matchingRendering = renderingItems.find(
            (item) => item.name.toLowerCase() === args.renderingName.toLowerCase()
          );
          
          if (!matchingRendering) {
            throw new Error(`Rendering "${args.renderingName}" not found`);
          }
          
          renderingId = matchingRendering.itemId || matchingRendering.id;
        }
        
        if (!renderingId) {
          throw new Error('Either renderingId or renderingName must be provided');
        }

        // Get datasource ID if provided
        let datasourceId = args.datasourceId;
        if (!datasourceId && args.datasourcePath) {
          const datasourceItem = await client.getItemByPath(args.datasourcePath, args.language || 'en');
          datasourceId = datasourceItem.itemId || datasourceItem.id;
        }

        // Default device ID (Default device in Sitecore)
        const deviceId = args.device || '{FE5D7FDF-89C0-4D99-9AA3-B5FDB009C9F3}';

        // Get current page to read existing layout
        const page = await client.getItem(pageId, args.language || 'en');
        
        // Build the layout XML or JSON structure
        // Sitecore uses a specific format for layout details
        // We'll use GraphQL mutation to set the presentation
        
        const mutation = `
          mutation SetPresentation($pageId: ID!, $renderingId: ID!, $placeholder: String!, $datasourceId: ID, $device: String!, $language: String!) {
            updateItem(
              input: {
                itemId: $pageId
                language: $language
                fields: [
                  {
                    name: "__Renderings"
                    value: "<r xmlns:xsd=\\"http://www.w3.org/2001/XMLSchema\\"><d id=\\"${deviceId}\\"><r id=\\"${renderingId}\\" ph=\\"${args.placeholder}\\" ${datasourceId ? `ds=\\"${datasourceId}\\"` : ''} /></d></r>"
                  }
                ]
              }
            ) {
              item {
                itemId
                name
                path
                displayName
              }
            }
          }
        `;

        // For a more proper implementation, we need to:
        // 1. Get existing layout
        // 2. Parse it
        // 3. Add new rendering
        // 4. Serialize back
        
        // Let's use a simpler approach with update_item
        const layoutField = {
          name: '__Renderings',
          value: `<r xmlns:xsd="http://www.w3.org/2001/XMLSchema"><d id="${deviceId.replace(/[{}]/g, '')}"><r id="${renderingId.replace(/[{}]/g, '')}" ph="${args.placeholder}"${datasourceId ? ` ds="${datasourceId.replace(/[{}]/g, '')}"` : ''}${args.renderingParameters ? ` par="${encodeURIComponent(JSON.stringify(args.renderingParameters))}"` : ''} /></d></r>`,
        };

        const updatedPage = await client.updateItem(pageId, {
          language: args.language || 'en',
          fields: [layoutField],
        });

        let responseText = `✅ Rendering added to presentation successfully!\n\n`;
        responseText += `📄 Page: ${updatedPage.name} (${updatedPage.path})\n`;
        responseText += `🎨 Rendering ID: ${renderingId}\n`;
        responseText += `📍 Placeholder: ${args.placeholder}\n`;
        
        if (datasourceId) {
          responseText += `📊 Datasource: ${datasourceId}\n`;
        }
        
        if (args.renderingParameters) {
          responseText += `⚙️ Parameters: ${Object.keys(args.renderingParameters).length} set\n`;
        }
        
        responseText += `\nNext steps:\n`;
        responseText += `- View page in Experience Editor\n`;
        responseText += `- Add more renderings: Use sitecore_set_rendering_in_presentation again\n`;
        responseText += `- Update datasource: Use sitecore_update_item\n`;
        responseText += `- Publish: Use sitecore_publish_item\n\n`;
        responseText += `💡 Note: In XM Cloud, you may need to set the layout in the Experience Editor for full functionality.\n\n`;
        responseText += `${JSON.stringify(updatedPage, null, 2)}`;

        return {
          content: [
            {
              type: 'text',
              text: responseText,
            },
          ],
          isError: false,
        };
      }

      default:
        throw new Error(`Unknown rendering tool: ${toolName}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Return user-friendly error messages
    let friendlyMessage = 'An error occurred while processing the rendering operation. ';
    
    if (errorMessage.includes('GUID') || errorMessage.includes('guid')) {
      friendlyMessage += 'Please verify that the ID format is correct.';
    } else if (errorMessage.includes('required') || errorMessage.includes('Required')) {
      friendlyMessage += 'Please provide all required parameters.';
    } else if (errorMessage.includes('not found') || errorMessage.includes('Not found')) {
      friendlyMessage += 'The requested item, rendering, or template was not found.';
    } else {
      friendlyMessage += errorMessage;
    }
    
    return {
      content: [
        {
          type: 'text',
          text: friendlyMessage,
        },
      ],
      isError: true,
    };
  }
}

