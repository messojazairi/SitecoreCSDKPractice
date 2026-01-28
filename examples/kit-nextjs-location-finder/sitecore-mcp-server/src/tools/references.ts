/**
 * MCP Tools for Sitecore Item References and Referrers
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { SitecoreClient } from '../sitecore-client.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('ReferencesTools');

export function createReferenceTools(client: SitecoreClient): Tool[] {
  return [
    {
      name: 'sitecore_get_item_references',
      description: 'Get all items that this item references (outgoing links). Shows what content, media, or other items this item depends on.',
      inputSchema: {
        type: 'object',
        properties: {
          itemId: {
            type: 'string',
            description: 'Item ID to get references for (without curly braces)',
          },
          path: {
            type: 'string',
            description: 'Item path (alternative to itemId, e.g., "/sitecore/content/Home")',
          },
          language: {
            type: 'string',
            description: 'Language code (default: "en")',
          },
        },
      },
    },
    {
      name: 'sitecore_get_item_referrers',
      description: 'Get all items that reference this item (incoming links). Shows what content depends on this item - useful for impact analysis before deleting or moving.',
      inputSchema: {
        type: 'object',
        properties: {
          itemId: {
            type: 'string',
            description: 'Item ID to get referrers for (without curly braces)',
          },
          path: {
            type: 'string',
            description: 'Item path (alternative to itemId, e.g., "/sitecore/content/Home")',
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

export async function handleReferenceTool(
  toolName: string,
  args: any,
  client: SitecoreClient
): Promise<any> {
  try {
    switch (toolName) {
      case 'sitecore_get_item_references': {
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

          // First get the source item
          const sourceItem = args.itemId
            ? await client.getItem(args.itemId, language)
            : await client.getItemByPath(args.path, language);

          // Query to get item references (what this item links to)
          const query = `
            query GetReferences($itemId: ID!) {
              item(where: { itemId: $itemId, language: "${language}" }) {
                itemId
                name
                path
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
          `;

          const result = await client.executeGraphQL(query, { 
            itemId: sourceItem.itemId || sourceItem.id 
          });

          // Parse fields to find references (GUIDs in field values)
          const guidRegex = /\{?([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\}?/g;
          const references: any[] = [];
          const uniqueIds = new Set<string>();

          if (result.item?.fields?.edges) {
            for (const fieldEdge of result.item.fields.edges) {
              const field = fieldEdge.node;
              const matches = field.value?.matchAll(guidRegex);
              
              if (matches) {
                for (const match of matches) {
                  const referencedId = match[1];
                  if (!uniqueIds.has(referencedId)) {
                    uniqueIds.add(referencedId);
                    
                    try {
                      // Try to get the referenced item
                      const referencedItem = await client.getItem(referencedId, language);
                      references.push({
                        fieldName: field.name,
                        targetItemId: referencedId,
                        targetItemName: referencedItem.name,
                        targetItemPath: referencedItem.path,
                        targetTemplateName: referencedItem.templateName,
                      });
                    } catch (error) {
                      // Item might not exist or be accessible
                      references.push({
                        fieldName: field.name,
                        targetItemId: referencedId,
                        targetItemName: '(Item not found)',
                        targetItemPath: '(Unknown)',
                        targetTemplateName: '(Unknown)',
                      });
                    }
                  }
                }
              }
            }
          }

          let responseText = `✅ Item References Retrieved\n\n`;
          responseText += `📍 Source Item: ${sourceItem.path}\n`;
          responseText += `🔗 References Count: ${references.length}\n`;
          responseText += `\n`;

          if (references.length > 0) {
            responseText += `## Outgoing References (What this item uses):\n\n`;
            
            // Group by field name
            const groupedByField: { [key: string]: any[] } = {};
            references.forEach((ref) => {
              if (!groupedByField[ref.fieldName]) {
                groupedByField[ref.fieldName] = [];
              }
              groupedByField[ref.fieldName].push(ref);
            });

            Object.entries(groupedByField).forEach(([fieldName, refs]) => {
              responseText += `### Field: ${fieldName} (${refs.length} reference${refs.length > 1 ? 's' : ''})\n\n`;
              refs.forEach((ref: any) => {
                responseText += `- **${ref.targetItemName}**\n`;
                responseText += `  - Path: ${ref.targetItemPath}\n`;
                responseText += `  - Template: ${ref.targetTemplateName}\n`;
                responseText += `  - ID: ${ref.targetItemId}\n`;
                responseText += `\n`;
              });
            });
          } else {
            responseText += `No references found. This item doesn't link to any other items.\n\n`;
          }

          responseText += `## Detailed Data:\n\n`;
          responseText += '```json\n';
          responseText += JSON.stringify({
            sourceItem: {
              id: sourceItem.itemId || sourceItem.id,
              name: sourceItem.name,
              path: sourceItem.path,
            },
            referencesCount: references.length,
            references: references,
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
                text: `❌ Failed to retrieve references:\n\n${errorMessage}\n\n💡 Tip: Verify the item ID or path is correct.`,
              },
            ],
            isError: true,
          };
        }
      }

      case 'sitecore_get_item_referrers': {
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

          // First get the target item
          const targetItem = args.itemId
            ? await client.getItem(args.itemId, language)
            : await client.getItemByPath(args.path, language);

          const targetId = targetItem.itemId || targetItem.id;

          // Search for items that contain this item's ID in their fields
          // This is a workaround since Sitecore GraphQL might not have direct referrer query
          const searchQuery = `
            query SearchReferrers {
              search(
                rootItem: "/sitecore"
                language: "${language}"
                first: 100
              ) {
                total
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

          const result = await client.executeGraphQL(searchQuery);

          // Filter items that reference the target item
          const referrers: any[] = [];
          const items = result.search?.results || [];

          for (const item of items) {
            const fields = item.fields?.edges || [];
            const referencingFields: string[] = [];

            for (const fieldEdge of fields) {
              const field = fieldEdge.node;
              if (field.value && field.value.includes(targetId)) {
                referencingFields.push(field.name);
              }
            }

            if (referencingFields.length > 0) {
              referrers.push({
                itemId: item.itemId,
                itemName: item.name,
                itemPath: item.path,
                templateName: item.template?.name,
                referencingFields: referencingFields,
              });
            }
          }

          let responseText = `✅ Item Referrers Retrieved\n\n`;
          responseText += `📍 Target Item: ${targetItem.path}\n`;
          responseText += `🔙 Referrers Count: ${referrers.length}\n`;
          responseText += `\n`;

          if (referrers.length > 0) {
            responseText += `## Incoming References (Items that use this item):\n\n`;
            responseText += `⚠️ **Impact Analysis**: Deleting or moving this item will affect ${referrers.length} item${referrers.length > 1 ? 's' : ''}.\n\n`;
            
            referrers.forEach((ref, index) => {
              responseText += `${index + 1}. **${ref.itemName}** (${ref.templateName})\n`;
              responseText += `   - Path: ${ref.itemPath}\n`;
              responseText += `   - ID: ${ref.itemId}\n`;
              responseText += `   - Referenced in fields: ${ref.referencingFields.join(', ')}\n`;
              responseText += `\n`;
            });
          } else {
            responseText += `✅ No referrers found. This item is not referenced by any other items.\n`;
            responseText += `It's safe to delete or move this item without breaking dependencies.\n\n`;
          }

          responseText += `## Detailed Data:\n\n`;
          responseText += '```json\n';
          responseText += JSON.stringify({
            targetItem: {
              id: targetId,
              name: targetItem.name,
              path: targetItem.path,
            },
            referrersCount: referrers.length,
            referrers: referrers,
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
                text: `❌ Failed to retrieve referrers:\n\n${errorMessage}\n\n💡 Tip: Verify the item ID or path is correct. This operation may take longer for large content trees.`,
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
              text: `❌ Unknown reference tool: ${toolName}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Reference tool error', error as Error, { tool: toolName });
    
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

