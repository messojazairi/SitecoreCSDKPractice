/**
 * MCP Tools for Sitecore Item Management
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { SitecoreClient } from '../sitecore-client.js';
import {
  validateItemCreation,
  formatValidationResult,
  getRecommendedIcon,
  suggestFolderStructure,
  SITECORE_ICONS,
  VALID_CONTENT_PATHS,
  type ItemCreationContext,
} from '../utils/sitecore-best-practices.js';

export function createItemTools(client: SitecoreClient): Tool[] {
  return [
    {
      name: 'sitecore_list_items',
      description: 'List content items by path or search query. Returns children of a specific path or search results.',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Item path (e.g., "/sitecore/content/Home"). If omitted, lists content root.',
          },
          language: {
            type: 'string',
            description: 'Language code (default: "en")',
          },
          includeChildren: {
            type: 'boolean',
            description: 'Include children in the response (default: true)',
          },
        },
      },
    },
    {
      name: 'sitecore_get_item',
      description: 'Get detailed information about a specific content item by ID or path.',
      inputSchema: {
        type: 'object',
        properties: {
          itemId: {
            type: 'string',
            description: 'Item ID (without curly braces)',
          },
          path: {
            type: 'string',
            description: 'Item path (alternative to itemId)',
          },
          language: {
            type: 'string',
            description: 'Language code (default: "en")',
          },
        },
      },
    },
    {
      name: 'sitecore_suggest_folder_structure',
      description: 'Get recommended folder structure for a specific content type. Helps you organize content properly before creating items.',
      inputSchema: {
        type: 'object',
        properties: {
          siteName: {
            type: 'string',
            description: 'Your site name (e.g., "MySite", "CorporateSite")',
          },
          contentType: {
            type: 'string',
            description: 'Type of content (e.g., "articles", "products", "locations", "events", "data")',
          },
        },
        required: ['siteName', 'contentType'],
      },
    },
    {
      name: 'sitecore_validate_item_creation',
      description: 'Validate item creation against Sitecore best practices BEFORE creating. Checks folder structure, naming conventions, and recommends icons. Use this to preview validation results without actually creating the item.',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name of the item to validate',
          },
          templateId: {
            type: 'string',
            description: 'Template ID to use (without curly braces)',
          },
          parentPath: {
            type: 'string',
            description: 'Parent path where item would be created (e.g., "/sitecore/content/Site/Data")',
          },
          parent: {
            type: 'string',
            description: 'Parent item ID (alternative to parentPath)',
          },
        },
        required: ['name'],
      },
    },
    {
      name: 'sitecore_create_item',
      description: 'Create a new content item using a template. The item will be placed under the specified parent. Includes automatic best practices validation: folder structure checks, naming conventions, and automatic icon assignment based on item type.',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Name of the item (e.g., "Home Page", "Product 123")',
          },
          templateId: {
            type: 'string',
            description: 'Template ID to use (without curly braces)',
          },
          parent: {
            type: 'string',
            description: 'Parent item ID (without curly braces)',
          },
          parentPath: {
            type: 'string',
            description: 'Parent path (alternative to parent ID, e.g., "/sitecore/content/Site")',
          },
          language: {
            type: 'string',
            description: 'Language code (default: "en")',
          },
          fields: {
            type: 'array',
            description: 'Field values to set on creation',
            items: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Field name',
                },
                value: {
                  type: 'string',
                  description: 'Field value',
                },
              },
              required: ['name', 'value'],
            },
          },
        },
        required: ['name', 'templateId'],
      },
    },
    {
      name: 'sitecore_update_item',
      description: 'Update an existing content item - modify fields, rename, or change display name.',
      inputSchema: {
        type: 'object',
        properties: {
          itemId: {
            type: 'string',
            description: 'Item ID to update (without curly braces)',
          },
          path: {
            type: 'string',
            description: 'Item path (alternative to itemId)',
          },
          language: {
            type: 'string',
            description: 'Language code (default: "en")',
          },
          name: {
            type: 'string',
            description: 'New item name (optional)',
          },
          fields: {
            type: 'array',
            description: 'Fields to update',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                value: { type: 'string' },
              },
              required: ['name', 'value'],
            },
          },
        },
        required: ['itemId'],
      },
    },
    {
      name: 'sitecore_delete_item',
      description: 'Delete a content item by ID or path. WARNING: This action cannot be undone!',
      inputSchema: {
        type: 'object',
        properties: {
          itemId: {
            type: 'string',
            description: 'Item ID to delete (without curly braces)',
          },
          path: {
            type: 'string',
            description: 'Item path (alternative to itemId)',
          },
        },
      },
    },
    {
      name: 'sitecore_move_item',
      description: 'Move an item to a different parent location in the content tree.',
      inputSchema: {
        type: 'object',
        properties: {
          itemId: {
            type: 'string',
            description: 'Item ID to move (without curly braces)',
          },
          targetParentId: {
            type: 'string',
            description: 'Target parent ID (without curly braces)',
          },
          targetParentPath: {
            type: 'string',
            description: 'Target parent path (alternative to targetParentId)',
          },
        },
        required: ['itemId'],
      },
    },
    {
      name: 'sitecore_search_items',
      description: 'Search for items by template, name, or field values using GraphQL query.',
      inputSchema: {
        type: 'object',
        properties: {
          templateId: {
            type: 'string',
            description: 'Filter by template ID',
          },
          templateName: {
            type: 'string',
            description: 'Filter by template name',
          },
          nameContains: {
            type: 'string',
            description: 'Search items where name contains this text',
          },
          path: {
            type: 'string',
            description: 'Search within this path',
          },
          language: {
            type: 'string',
            description: 'Language code (default: "en")',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results (default: 20)',
          },
        },
      },
    },
    {
      name: 'sitecore_get_item_descendants',
      description: 'Get all descendants of an item recursively, optionally limited by depth. Returns entire content trees for navigation and analysis.',
      inputSchema: {
        type: 'object',
        properties: {
          itemId: {
            type: 'string',
            description: 'Item ID to get descendants for (without curly braces)',
          },
          path: {
            type: 'string',
            description: 'Item path (alternative to itemId, e.g., "/sitecore/content/Home")',
          },
          depth: {
            type: 'number',
            description: 'Maximum depth to traverse (default: unlimited). 1 = direct children only, 2 = children and grandchildren, etc.',
          },
          language: {
            type: 'string',
            description: 'Language code (default: "en")',
          },
        },
      },
    },
    {
      name: 'sitecore_get_item_children',
      description: 'Get direct children of an item with optional template and field information. More focused than descendants - returns only immediate children.',
      inputSchema: {
        type: 'object',
        properties: {
          itemId: {
            type: 'string',
            description: 'Item ID to get children for (without curly braces)',
          },
          path: {
            type: 'string',
            description: 'Item path (alternative to itemId, e.g., "/sitecore/content/Home")',
          },
          includeTemplateInfo: {
            type: 'boolean',
            description: 'Include full template details for each child (default: true)',
          },
          templateFilter: {
            type: 'string',
            description: 'Optional: Filter children by template name',
          },
          namePattern: {
            type: 'string',
            description: 'Optional: Filter children by name pattern (contains)',
          },
          language: {
            type: 'string',
            description: 'Language code (default: "en")',
          },
        },
      },
    },
    {
      name: 'sitecore_search_items_advanced',
      description: 'Advanced search with multiple filters: template, field values, path, and pagination. More powerful than basic search for complex queries.',
      inputSchema: {
        type: 'object',
        properties: {
          rootPath: {
            type: 'string',
            description: 'Root path to search within (e.g., "/sitecore/content")',
          },
          templateName: {
            type: 'string',
            description: 'Filter by template name (e.g., "Sample Item")',
          },
          templateId: {
            type: 'string',
            description: 'Filter by template ID (alternative to templateName)',
          },
          fieldFilters: {
            type: 'array',
            description: 'Array of field filters to match',
            items: {
              type: 'object',
              properties: {
                fieldName: { type: 'string' },
                fieldValue: { type: 'string' },
              },
            },
          },
          pageSize: {
            type: 'number',
            description: 'Number of results per page (default: 50, max: 100)',
          },
          language: {
            type: 'string',
            description: 'Language code (default: "en")',
          },
        },
      },
    },
  ];
}

export async function handleItemTool(
  toolName: string,
  args: any,
  client: SitecoreClient
): Promise<any> {
  try {
    switch (toolName) {
      case 'sitecore_list_items': {
        const path = args.path || '/sitecore/content';
        const items = await client.listItems(path, args.language, args.includeChildren);
        
        return {
          content: [
            {
              type: 'text',
              text: `📁 Items at ${path}:\n\n${JSON.stringify(
                {
                  path,
                  count: items.length,
                  items: items.map((item) => ({
                    id: item.itemId || item.id,
                    name: item.name,
                    templateName: item.templateName,
                    hasChildren: item.hasChildren,
                    path: item.path,
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

      case 'sitecore_suggest_folder_structure': {
        const siteName = args.siteName || 'MySite';
        const contentType = args.contentType || 'content';
        
        const suggestedPath = suggestFolderStructure(siteName, contentType);
        
        let responseText = `📁 **Recommended Folder Structure**\n\n`;
        responseText += `**Site Name:** ${siteName}\n`;
        responseText += `**Content Type:** ${contentType}\n\n`;
        responseText += `---\n\n`;
        responseText += `### Suggested Path\n`;
        responseText += `\`${suggestedPath}\`\n\n`;
        responseText += `### Recommended Hierarchy\n\n`;
        responseText += `\`\`\`\n`;
        responseText += `/sitecore/content/\n`;
        responseText += `└── ${siteName}/\n`;
        responseText += `    └── ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}/\n`;
        responseText += `        └── [Category]/\n`;
        responseText += `            └── [SubCategory]/\n`;
        responseText += `                └── [Your Item]\n`;
        responseText += `\`\`\`\n\n`;
        
        responseText += `### Best Practices\n\n`;
        responseText += `1. **Always create content in proper folders** - Never create items directly under \`/sitecore/content\`\n`;
        responseText += `2. **Use meaningful folder names** - Organize by category, date, or logical grouping\n`;
        responseText += `3. **Keep hierarchy manageable** - Aim for 3-6 levels deep maximum\n`;
        responseText += `4. **Consistent naming** - Use the same naming convention across all folders\n\n`;
        
        responseText += `### Example Structures by Content Type\n\n`;
        responseText += `| Content Type | Suggested Path |\n`;
        responseText += `|-------------|----------------|\n`;
        responseText += `| Articles | \`/sitecore/content/${siteName}/Articles/[Year]/[Month]\` |\n`;
        responseText += `| Products | \`/sitecore/content/${siteName}/Products/[Category]/[SubCategory]\` |\n`;
        responseText += `| Locations | \`/sitecore/content/${siteName}/Locations/[Region]/[Country]\` |\n`;
        responseText += `| Events | \`/sitecore/content/${siteName}/Events/[Year]/[Type]\` |\n`;
        responseText += `| Data Sources | \`/sitecore/content/${siteName}/Data/[ComponentName]\` |\n`;
        responseText += `| Pages | \`/sitecore/content/${siteName}/Home/[Section]\` |\n\n`;
        
        responseText += `### Next Steps\n\n`;
        responseText += `1. Create the folder structure first using \`sitecore_create_item\` with a Folder template\n`;
        responseText += `2. Then create your content items within the appropriate folders\n`;
        responseText += `3. Use \`sitecore_validate_item_creation\` to check your item before creating\n`;

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

      case 'sitecore_validate_item_creation': {
        // Validate item creation against best practices without actually creating
        let templateName: string | undefined;
        let parentPath = args.parentPath;

        // Try to get template name for better recommendations
        if (args.templateId) {
          try {
            const template = await client.getTemplate(args.templateId);
            templateName = template?.name;
          } catch {
            console.log('[VALIDATION] Could not fetch template info');
          }
        }

        // If parent ID provided but no path, try to get the path
        if (args.parent && !parentPath) {
          try {
            const parentItem = await client.getItem(args.parent);
            parentPath = parentItem?.path;
          } catch {
            console.log('[VALIDATION] Could not fetch parent item info');
          }
        }

        const validationContext: ItemCreationContext = {
          name: args.name || '',
          templateId: args.templateId,
          templateName: templateName,
          parentPath: parentPath,
          parentId: args.parent,
        };

        const validationResult = validateItemCreation(validationContext);
        const formattedResult = formatValidationResult(validationResult);

        let responseText = `📋 **Item Creation Validation Results**\n\n`;
        responseText += `**Item Name:** ${args.name || '(not provided)'}\n`;
        responseText += `**Template:** ${templateName || args.templateId || '(not provided)'}\n`;
        responseText += `**Parent Path:** ${parentPath || args.parent || '(not provided)'}\n\n`;
        responseText += `---\n\n`;
        responseText += formattedResult;
        
        if (validationResult.isValid) {
          responseText += `\n\n✅ **Ready to Create**\n`;
          responseText += `This item passes all validation checks. You can proceed with creation using \`sitecore_create_item\`.`;
        } else {
          responseText += `\n\n❌ **Cannot Create**\n`;
          responseText += `Please address the errors above before attempting to create this item.`;
        }

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

      case 'sitecore_get_item': {
        if (!args.itemId && !args.path) {
          return {
            content: [
              {
                type: 'text',
                text: 'Please provide either an itemId or path to retrieve the item.',
              },
            ],
            isError: true,
          };
        }

        try {
          const item = args.itemId
            ? await client.getItem(args.itemId, args.language || 'en')
            : await client.getItemByPath(args.path, args.language || 'en');

          return {
            content: [
              {
                type: 'text',
                text: `📄 Item Details:\n\n${JSON.stringify(item, null, 2)}`,
              },
            ],
            isError: false,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          // Return graceful error message
          return {
            content: [
              {
                type: 'text',
                text: `Unable to retrieve item. ${errorMessage.includes('GUID') ? 'Please check that the item ID is valid.' : 'Please verify the item ID or path is correct.'}`,
              },
            ],
            isError: true,
          };
        }
      }

      case 'sitecore_create_item': {
        if (!args.name) throw new Error('Item name is required');
        if (!args.templateId) throw new Error('Template ID is required');
        if (!args.parent && !args.parentPath) {
          throw new Error('Either parent ID or parentPath must be provided');
        }

        // Get template name for icon recommendation (if possible)
        let templateName: string | undefined;
        try {
          const template = await client.getTemplate(args.templateId);
          templateName = template?.name;
        } catch {
          // Template lookup failed, continue without it
          console.log('[BEST PRACTICES] Could not fetch template info for icon recommendation');
        }

        // ============================================
        // SITECORE BEST PRACTICES VALIDATION
        // ============================================
        const validationContext: ItemCreationContext = {
          name: args.name,
          templateId: args.templateId,
          templateName: templateName,
          parentPath: args.parentPath,
          parentId: args.parent,
          fields: args.fields,
        };

        const validationResult = validateItemCreation(validationContext);
        
        // If validation has critical errors, prevent item creation
        if (!validationResult.isValid) {
          const validationMessage = formatValidationResult(validationResult);
          return {
            content: [
              {
                type: 'text',
                text: `🚫 **Item Creation Blocked - Best Practices Violation**\n\n` +
                  `The item cannot be created due to the following issues:\n\n` +
                  `${validationMessage}\n\n` +
                  `Please address these issues and try again.`,
              },
            ],
            isError: true,
          };
        }

        // Log warnings and suggestions (but don't block creation)
        if (validationResult.warnings.length > 0 || validationResult.suggestions.length > 0) {
          console.log('[BEST PRACTICES] Validation warnings/suggestions:');
          validationResult.warnings.forEach(w => console.log(`  ⚠️ ${w}`));
          validationResult.suggestions.forEach(s => console.log(`  💡 ${s}`));
        }

        // Prepare fields array
        const fields = args.fields || [];

        // Add recommended icon if not already set and we have a recommendation
        const recommendedIcon = getRecommendedIcon(templateName, args.name);
        const hasIconField = fields.some(
          (f: { name: string }) => f.name.toLowerCase() === '__icon' || f.name.toLowerCase() === 'icon'
        );
        
        if (!hasIconField && recommendedIcon !== SITECORE_ICONS.DEFAULT) {
          console.log(`[BEST PRACTICES] Adding recommended icon: ${recommendedIcon}`);
          fields.push({ name: '__Icon', value: recommendedIcon });
        }

        // Create the item (without owner - it's a protected field that must be set after creation)
        const item = await client.createItem({
          name: args.name,
          templateId: args.templateId,
          parent: args.parent,
          parentPath: args.parentPath,
          language: args.language || 'en',
          fields: fields,
        });

        // CRITICAL: Update owner AFTER item creation (owner is a protected system field)
        const defaultOwner = client.getDefaultOwner();
        const itemId = item.itemId || item.id;
        try {
          console.log(`[OWNER UPDATE] Setting item owner to: ${defaultOwner}`);
          console.log(`[OWNER UPDATE] Item ID: ${itemId}`);
          console.log(`[OWNER UPDATE] Language: ${args.language || 'en'}`);
          
          // Use the dedicated setItemOwner method that tries multiple strategies
          await client.setItemOwner(itemId, defaultOwner, args.language || 'en');
          
          console.log(`[OWNER UPDATE] ✅ Item owner updated successfully to: ${defaultOwner}`);
        } catch (ownerError) {
          // Log detailed error but don't fail - item is still created
          console.error('[OWNER UPDATE] ❌ Failed to update item owner:', ownerError);
          console.error('[OWNER UPDATE] Owner was supposed to be:', defaultOwner);
          console.error('[OWNER UPDATE] Error details:', (ownerError as Error).message);
          console.error('[OWNER UPDATE] Item will be created but owner will remain as API user');
        }

        let responseText = `✅ Item "${item.name}" created successfully!\n\n` +
          `📍 Path: ${item.path}\n` +
          `🆔 ID: ${item.itemId || item.id}\n` +
          `📝 Template: ${item.templateName}\n` +
          `👤 Owner: ${defaultOwner}\n`;
        
        // Add icon info
        if (recommendedIcon !== SITECORE_ICONS.DEFAULT) {
          responseText += `🎨 Icon: ${recommendedIcon}\n`;
        }
        
        if (args.fields && args.fields.length > 0) {
          responseText += `\n📋 Fields set (${args.fields.length}):\n`;
          args.fields.forEach((field: { name: string; value: string }) => {
            responseText += `   - ${field.name}: ${field.value}\n`;
          });
        }
        
        // Add best practices feedback
        if (validationResult.warnings.length > 0 || validationResult.suggestions.length > 0) {
          responseText += `\n📋 **Best Practices Feedback:**\n`;
          if (validationResult.warnings.length > 0) {
            responseText += `\n⚠️ Warnings:\n`;
            validationResult.warnings.forEach(w => {
              responseText += `   - ${w}\n`;
            });
          }
          if (validationResult.suggestions.length > 0) {
            responseText += `\n💡 Suggestions:\n`;
            validationResult.suggestions.forEach(s => {
              responseText += `   - ${s}\n`;
            });
          }
        }
        
        responseText += `\nNext steps:\n` +
          `- View in Content Editor: ${item.path}\n` +
          `- Update fields: Use sitecore_update_item\n` +
          `- Publish: Use sitecore_publish_item\n\n` +
          `${JSON.stringify(item, null, 2)}`;

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

      case 'sitecore_update_item': {
        if (!args.itemId && !args.path) {
          throw new Error('Either itemId or path must be provided');
        }

        const itemId = args.itemId || (await client.getItemByPath(args.path)).itemId;
        
        const item = await client.updateItem(itemId, {
          name: args.name,
          language: args.language || 'en',
          fields: args.fields || [],
        });

        let responseText = `✅ Item "${item.name}" updated successfully!\n\n` +
          `📍 Path: ${item.path}\n` +
          `🆔 ID: ${item.itemId || item.id}\n`;
        
        if (args.fields && args.fields.length > 0) {
          responseText += `\n📋 Fields updated (${args.fields.length}):\n`;
          args.fields.forEach((field: { name: string; value: string }) => {
            responseText += `   - ${field.name}: ${field.value}\n`;
          });
        }
        
        if (args.name) {
          responseText += `\n📝 Name updated to: ${args.name}\n`;
        }
        
        responseText += `\n${JSON.stringify(item, null, 2)}`;

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

      case 'sitecore_delete_item': {
        if (!args.itemId && !args.path) {
          throw new Error('Either itemId or path must be provided');
        }

        const itemId = args.itemId || (await client.getItemByPath(args.path)).itemId;
        
        await client.deleteItem(itemId);

        return {
          content: [
            {
              type: 'text',
              text: `✅ Item deleted successfully (ID: ${itemId})`,
            },
          ],
          isError: false,
        };
      }

      case 'sitecore_move_item': {
        if (!args.itemId) throw new Error('itemId is required');
        if (!args.targetParentId && !args.targetParentPath) {
          throw new Error('Either targetParentId or targetParentPath must be provided');
        }

        const targetParentId = args.targetParentId || 
          (await client.getItemByPath(args.targetParentPath)).itemId;

        const item = await client.moveItem(args.itemId, {
          targetParentId,
        });

        return {
          content: [
            {
              type: 'text',
              text: `✅ Item moved successfully!\n\n` +
                `New path: ${item.path}\n\n` +
                `${JSON.stringify(item, null, 2)}`,
            },
          ],
          isError: false,
        };
      }

      case 'sitecore_search_items': {
        const items = await client.searchItems({
          templateId: args.templateId,
          templateName: args.templateName,
          nameContains: args.nameContains,
          path: args.path,
          language: args.language,
          limit: args.limit || 20,
        });

        return {
          content: [
            {
              type: 'text',
              text: `🔍 Search Results:\n\n${JSON.stringify(
                {
                  count: items.length,
                  items: items.map((item) => ({
                    id: item.itemId || item.id,
                    name: item.name,
                    path: item.path,
                    templateName: item.templateName,
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

      case 'sitecore_get_item_descendants': {
        if (!args.itemId && !args.path) {
          return {
            content: [
              {
                type: 'text',
                text: '❌ Error: Either itemId or path is required.',
              },
            ],
            isError: true,
          };
        }

        try {
          // First get the root item
          const rootItem = args.itemId
            ? await client.getItem(args.itemId, args.language || 'en')
            : await client.getItemByPath(args.path, args.language || 'en');

          // Build recursive GraphQL query for descendants
          const maxDepth = args.depth || 10; // Default max depth to prevent infinite recursion
          const language = args.language || 'en';

          // Build the recursive children fragment
          const buildChildrenFragment = (currentDepth: number): string => {
            if (currentDepth <= 0) return '';
            
            return `
              children {
                edges {
                  node {
                    itemId
                    name
                    path
                    displayName
                    template {
                      templateId
                      name
                    }
                    hasChildren
                    ${currentDepth > 1 ? buildChildrenFragment(currentDepth - 1) : ''}
                  }
                }
              }
            `;
          };

          const query = `
            query GetDescendants($itemId: ID!) {
              item(where: { itemId: $itemId, language: "${language}" }) {
                itemId
                name
                path
                displayName
                template {
                  templateId
                  name
                }
                hasChildren
                ${buildChildrenFragment(maxDepth)}
              }
            }
          `;

          const result = await client.executeGraphQL(query, { 
            itemId: rootItem.itemId || rootItem.id 
          });

          // Flatten the tree structure into a list
          const flattenDescendants = (item: any, currentDepth: number = 0): any[] => {
            const descendants: any[] = [];
            
            if (item.children?.edges) {
              for (const edge of item.children.edges) {
                const child = edge.node;
                descendants.push({
                  id: child.itemId,
                  name: child.name,
                  path: child.path,
                  displayName: child.displayName,
                  templateId: child.template?.templateId,
                  templateName: child.template?.name,
                  hasChildren: child.hasChildren,
                  depth: currentDepth + 1,
                });

                // Recursively add children
                if (child.children) {
                  descendants.push(...flattenDescendants(child, currentDepth + 1));
                }
              }
            }

            return descendants;
          };

          const descendants = flattenDescendants(result.item);

          let responseText = `✅ Item Descendants Retrieved\n\n`;
          responseText += `📍 Root: ${rootItem.path}\n`;
          responseText += `🔢 Total Descendants: ${descendants.length}\n`;
          if (args.depth) {
            responseText += `📊 Max Depth: ${args.depth}\n`;
          }
          responseText += `\n`;

          // Create tree visualization
          responseText += `## Content Tree:\n\n`;
          responseText += `${rootItem.name} (${rootItem.templateName})\n`;
          
          descendants.forEach((item) => {
            const indent = '  '.repeat(item.depth);
            const childMarker = item.hasChildren ? '📁' : '📄';
            responseText += `${indent}${childMarker} ${item.name} (${item.templateName})\n`;
          });

          responseText += `\n## Detailed Data:\n\n`;
          responseText += '```json\n';
          responseText += JSON.stringify({
            root: {
              id: rootItem.itemId || rootItem.id,
              name: rootItem.name,
              path: rootItem.path,
            },
            descendantsCount: descendants.length,
            descendants: descendants,
          }, null, 2);
          responseText += '\n```';

          return {
            content: [
              {
                type: 'text',
                text: responseText,
              },
            ],
            isError: false,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: 'text',
                text: `❌ Failed to retrieve descendants:\n\n${errorMessage}\n\n💡 Tip: Verify the item ID or path is correct.`,
              },
            ],
            isError: true,
          };
        }
      }

      case 'sitecore_get_item_children': {
        if (!args.itemId && !args.path) {
          return {
            content: [
              {
                type: 'text',
                text: '❌ Error: Either itemId or path is required.',
              },
            ],
            isError: true,
          };
        }

        try {
          const language = args.language || 'en';
          const includeTemplateInfo = args.includeTemplateInfo !== false;

          // First get the parent item
          const parentItem = args.itemId
            ? await client.getItem(args.itemId, language)
            : await client.getItemByPath(args.path, language);

          // Build GraphQL query for children
          const query = `
            query GetChildren($itemId: ID!) {
              item(where: { itemId: $itemId, language: "${language}" }) {
                itemId
                name
                path
                children {
                  edges {
                    node {
                      itemId
                      name
                      path
                      displayName
                      hasChildren
                      template {
                        templateId
                        name
                      }
                      ${includeTemplateInfo ? `
                      fields {
                        edges {
                          node {
                            name
                            value
                          }
                        }
                      }
                      ` : ''}
                    }
                  }
                }
              }
            }
          `;

          const result = await client.executeGraphQL(query, { 
            itemId: parentItem.itemId || parentItem.id 
          });

          let children = result.item.children?.edges?.map((edge: any) => ({
            id: edge.node.itemId,
            name: edge.node.name,
            path: edge.node.path,
            displayName: edge.node.displayName,
            templateId: edge.node.template?.templateId,
            templateName: edge.node.template?.name,
            hasChildren: edge.node.hasChildren,
            fields: edge.node.fields?.edges?.map((f: any) => ({
              name: f.node.name,
              value: f.node.value,
            })) || [],
          })) || [];

          // Apply filters if provided
          if (args.templateFilter) {
            children = children.filter((child: any) => 
              child.templateName?.toLowerCase().includes(args.templateFilter.toLowerCase())
            );
          }

          if (args.namePattern) {
            children = children.filter((child: any) => 
              child.name?.toLowerCase().includes(args.namePattern.toLowerCase())
            );
          }

          let responseText = `✅ Item Children Retrieved\n\n`;
          responseText += `📍 Parent: ${parentItem.path}\n`;
          responseText += `🔢 Children Count: ${children.length}\n`;
          if (args.templateFilter) {
            responseText += `🔍 Template Filter: ${args.templateFilter}\n`;
          }
          if (args.namePattern) {
            responseText += `🔍 Name Pattern: ${args.namePattern}\n`;
          }
          responseText += `\n`;

          if (children.length > 0) {
            responseText += `## Children:\n\n`;
            children.forEach((child: any) => {
              const childMarker = child.hasChildren ? '📁' : '📄';
              responseText += `${childMarker} **${child.name}**\n`;
              responseText += `   - Path: ${child.path}\n`;
              responseText += `   - Template: ${child.templateName}\n`;
              responseText += `   - ID: ${child.id}\n`;
              if (includeTemplateInfo && child.fields.length > 0) {
                responseText += `   - Fields: ${child.fields.length}\n`;
              }
              responseText += `\n`;
            });
          } else {
            responseText += `No children found.\n\n`;
          }

          responseText += `## Detailed Data:\n\n`;
          responseText += '```json\n';
          responseText += JSON.stringify({
            parent: {
              id: parentItem.itemId || parentItem.id,
              name: parentItem.name,
              path: parentItem.path,
            },
            childrenCount: children.length,
            children: children,
          }, null, 2);
          responseText += '\n```';

          return {
            content: [
              {
                type: 'text',
                text: responseText,
              },
            ],
            isError: false,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: 'text',
                text: `❌ Failed to retrieve children:\n\n${errorMessage}\n\n💡 Tip: Verify the item ID or path is correct.`,
              },
            ],
            isError: true,
          };
        }
      }

      case 'sitecore_search_items_advanced': {
        try {
          const language = args.language || 'en';
          const pageSize = Math.min(args.pageSize || 50, 100);
          const rootPath = args.rootPath || '/sitecore/content';

          // Build where clause conditions
          const conditions: string[] = [];

          if (args.templateName) {
            conditions.push(`{ name: "_templatename", value: "${args.templateName}" }`);
          }

          if (args.templateId) {
            conditions.push(`{ name: "_template", value: "${args.templateId}" }`);
          }

          if (args.fieldFilters && args.fieldFilters.length > 0) {
            args.fieldFilters.forEach((filter: any) => {
              conditions.push(`{ name: "${filter.fieldName}", value: "${filter.fieldValue}" }`);
            });
          }

          const whereClause = conditions.length > 0 
            ? `where: { AND: [${conditions.join(', ')}] }`
            : '';

          const query = `
            query AdvancedSearch {
              search(
                rootItem: "${rootPath}"
                language: "${language}"
                ${whereClause}
                first: ${pageSize}
              ) {
                total
                pageInfo {
                  hasNextPage
                  endCursor
                }
                results {
                  itemId
                  name
                  path
                  displayName
                  template {
                    templateId
                    name
                  }
                  fields {
                    edges {
                      node {
                        name
                        value
                      }
                    }
                  }
                }
              }
            }
          `;

          const result = await client.executeGraphQL(query);

          const items = result.search?.results?.map((item: any) => ({
            id: item.itemId,
            name: item.name,
            path: item.path,
            displayName: item.displayName,
            templateId: item.template?.templateId,
            templateName: item.template?.name,
            fields: item.fields?.edges?.map((f: any) => ({
              name: f.node.name,
              value: f.node.value,
            })) || [],
          })) || [];

          const total = result.search?.total || 0;
          const hasMore = result.search?.pageInfo?.hasNextPage || false;

          let responseText = `✅ Advanced Search Results\n\n`;
          responseText += `🔍 Search Criteria:\n`;
          responseText += `   - Root Path: ${rootPath}\n`;
          if (args.templateName) {
            responseText += `   - Template Name: ${args.templateName}\n`;
          }
          if (args.templateId) {
            responseText += `   - Template ID: ${args.templateId}\n`;
          }
          if (args.fieldFilters?.length > 0) {
            responseText += `   - Field Filters: ${args.fieldFilters.length}\n`;
          }
          responseText += `\n`;
          responseText += `📊 Results: ${items.length} of ${total} total\n`;
          if (hasMore) {
            responseText += `⚠️ More results available (showing first ${pageSize})\n`;
          }
          responseText += `\n`;

          if (items.length > 0) {
            responseText += `## Items Found:\n\n`;
            items.forEach((item: any, index: number) => {
              responseText += `${index + 1}. **${item.name}** (${item.templateName})\n`;
              responseText += `   - Path: ${item.path}\n`;
              responseText += `   - ID: ${item.id}\n`;
              if (item.fields.length > 0) {
                responseText += `   - Fields: ${item.fields.length}\n`;
              }
              responseText += `\n`;
            });
          } else {
            responseText += `No items found matching the criteria.\n\n`;
          }

          responseText += `## Detailed Data:\n\n`;
          responseText += '```json\n';
          responseText += JSON.stringify({
            total: total,
            returned: items.length,
            hasMore: hasMore,
            items: items,
          }, null, 2);
          responseText += '\n```';

          return {
            content: [
              {
                type: 'text',
                text: responseText,
              },
            ],
            isError: false,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: 'text',
                text: `❌ Advanced search failed:\n\n${errorMessage}\n\n💡 Tip: Check your search criteria and root path.`,
              },
            ],
            isError: true,
          };
        }
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${toolName}. Please check the tool name and try again.`,
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Return user-friendly error messages
    let friendlyMessage = 'An error occurred while processing your request. ';
    
    if (errorMessage.includes('GUID') || errorMessage.includes('guid')) {
      friendlyMessage += 'Please verify that the ID format is correct.';
    } else if (errorMessage.includes('required') || errorMessage.includes('Required')) {
      friendlyMessage += 'Please provide all required parameters.';
    } else if (errorMessage.includes('not found') || errorMessage.includes('Not found')) {
      friendlyMessage += 'The requested item or resource was not found.';
    } else if (errorMessage.includes('language') || errorMessage.includes('Language')) {
      friendlyMessage += 'There was an issue with the language parameter.';
    } else {
      friendlyMessage += 'Please verify your input and try again.';
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

