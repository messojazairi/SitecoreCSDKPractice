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
      description: `Add a rendering to a page's presentation details (final layout). This places a component on a page in a specific placeholder.

REQUIRED PARAMETERS:
1. Page identification - provide ONE of: pagePath (recommended) OR pageId
2. Rendering identification - provide ONE of: renderingPath (recommended) OR renderingId OR renderingName
3. placeholder - the placeholder key where the rendering should be placed

OPTIONAL PARAMETERS:
- datasourcePath or datasourceId - for content data source
- renderingParameters - additional rendering parameters
- device - device ID (defaults to Default device)
- language - language code (defaults to "en")

EXAMPLE USAGE:
{
  "pagePath": "/sitecore/content/MySite/Home",
  "renderingPath": "/sitecore/layout/Renderings/Project/MySite/MyComponent",
  "placeholder": "headless-main",
  "datasourcePath": "/sitecore/content/MySite/Data/MyDataSource"
}`,
      inputSchema: {
        type: 'object',
        properties: {
          pagePath: {
            type: 'string',
            description: 'RECOMMENDED: The page path where the rendering should be added (e.g., "/sitecore/content/MySite/Home")',
          },
          pageId: {
            type: 'string',
            description: 'Alternative: The page item ID (GUID without curly braces)',
          },
          renderingPath: {
            type: 'string',
            description: 'RECOMMENDED: The full rendering path (e.g., "/sitecore/layout/Renderings/Project/MySite/MyComponent")',
          },
          renderingId: {
            type: 'string',
            description: 'Alternative: The rendering item ID (GUID without curly braces)',
          },
          renderingName: {
            type: 'string',
            description: 'Alternative: The rendering name to search for (less reliable, use renderingPath when possible)',
          },
          placeholder: {
            type: 'string',
            description: 'REQUIRED: The placeholder key where the rendering should be placed (e.g., "headless-main", "main", "header", "content")',
          },
          datasourcePath: {
            type: 'string',
            description: 'Optional: Data source item path for the rendering content',
          },
          datasourceId: {
            type: 'string',
            description: 'Optional: Data source item ID (GUID without curly braces)',
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
            description: 'Optional: Language code (default: "en")',
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
        // ============================================
        // UPFRONT VALIDATION - Check all required parameters first
        // ============================================
        
        // Validate placeholder (always required)
        if (!args.placeholder) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ **Missing Required Parameter: placeholder**

The \`placeholder\` parameter is required. This is the key where the rendering will be placed on the page.

Common placeholder values:
- \`headless-main\` - Main content area (most common for XM Cloud)
- \`main\` - Main content area
- \`header\` - Header section
- \`footer\` - Footer section
- \`content\` - Content area

Example:
\`\`\`json
{
  "pagePath": "/sitecore/content/MySite/Home",
  "renderingPath": "/sitecore/layout/Renderings/Project/MySite/MyComponent",
  "placeholder": "headless-main"
}
\`\`\``,
              },
            ],
            isError: true,
          };
        }

        // Validate page identification (must have pageId OR pagePath)
        if (!args.pageId && !args.pagePath) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ **Missing Required Parameter: Page Identification**

You must provide either \`pagePath\` (recommended) or \`pageId\` to identify the page where the rendering should be added.

Example with pagePath (recommended):
\`\`\`json
{
  "pagePath": "/sitecore/content/MySite/Home",
  "renderingPath": "/sitecore/layout/Renderings/Project/MySite/MyComponent",
  "placeholder": "headless-main"
}
\`\`\`

Example with pageId:
\`\`\`json
{
  "pageId": "110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9",
  "renderingPath": "/sitecore/layout/Renderings/Project/MySite/MyComponent",
  "placeholder": "headless-main"
}
\`\`\``,
              },
            ],
            isError: true,
          };
        }

        // Validate rendering identification (must have renderingId OR renderingPath OR renderingName)
        if (!args.renderingId && !args.renderingPath && !args.renderingName) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ **Missing Required Parameter: Rendering Identification**

You must provide one of:
- \`renderingPath\` (recommended) - Full path to the rendering
- \`renderingId\` - GUID of the rendering item
- \`renderingName\` - Name to search for (less reliable)

Example with renderingPath (recommended):
\`\`\`json
{
  "pagePath": "/sitecore/content/MySite/Home",
  "renderingPath": "/sitecore/layout/Renderings/Project/MySite/MyComponent",
  "placeholder": "headless-main"
}
\`\`\`

Example with renderingId:
\`\`\`json
{
  "pagePath": "/sitecore/content/MySite/Home",
  "renderingId": "A1B2C3D4-E5F6-7890-ABCD-EF1234567890",
  "placeholder": "headless-main"
}
\`\`\``,
              },
            ],
            isError: true,
          };
        }

        // ============================================
        // RESOLVE PAGE ID
        // ============================================
        let pageId = args.pageId;
        if (!pageId && args.pagePath) {
          try {
            const pageItem = await client.getItemByPath(args.pagePath, args.language || 'en');
            pageId = pageItem.itemId || pageItem.id;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
              content: [
                {
                  type: 'text',
                  text: `❌ **Page Not Found**

Could not find page at path: \`${args.pagePath}\`

Error: ${errorMessage}

Please verify:
1. The page path is correct
2. The page exists in Sitecore
3. You have permission to access this page

💡 Tip: Use \`sitecore_get_item\` with the path to verify it exists first.`,
                },
              ],
              isError: true,
            };
          }
        }

        // ============================================
        // RESOLVE RENDERING ID
        // ============================================
        let renderingId = args.renderingId;
        if (!renderingId && args.renderingPath) {
          try {
            const renderingItem = await client.getItemByPath(args.renderingPath, args.language || 'en');
            renderingId = renderingItem.itemId || renderingItem.id;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
              content: [
                {
                  type: 'text',
                  text: `❌ **Rendering Not Found**

Could not find rendering at path: \`${args.renderingPath}\`

Error: ${errorMessage}

Please verify:
1. The rendering path is correct
2. The rendering exists in Sitecore under /sitecore/layout/Renderings/
3. You have permission to access this rendering

💡 Tip: Use \`sitecore_list_items\` with path \`/sitecore/layout/Renderings/Project\` to see available renderings.`,
                },
              ],
              isError: true,
            };
          }
        }
        
        if (!renderingId && args.renderingName) {
          try {
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
              return {
                content: [
                  {
                    type: 'text',
                    text: `❌ **Rendering Not Found By Name**

Could not find rendering named: \`${args.renderingName}\`

Search returned ${renderingItems.length} items, but none matched exactly.

${renderingItems.length > 0 ? `Found similar items:\n${renderingItems.map(r => `- ${r.name} (${r.path})`).join('\n')}\n\n` : ''}💡 Recommendation: Use \`renderingPath\` instead of \`renderingName\` for more reliable results.

Example:
\`\`\`json
{
  "pagePath": "${args.pagePath || '/sitecore/content/MySite/Home'}",
  "renderingPath": "/sitecore/layout/Renderings/Project/MySite/YourRendering",
  "placeholder": "${args.placeholder}"
}
\`\`\``,
                  },
                ],
                isError: true,
              };
            }
            
            renderingId = matchingRendering.itemId || matchingRendering.id;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
              content: [
                {
                  type: 'text',
                  text: `❌ **Rendering Search Failed**

Error searching for rendering named: \`${args.renderingName}\`

Error: ${errorMessage}

💡 Recommendation: Use \`renderingPath\` instead of \`renderingName\` for more reliable results.`,
                },
              ],
              isError: true,
            };
          }
        }

        // ============================================
        // RESOLVE DATASOURCE ID (Optional)
        // ============================================
        let datasourceId = args.datasourceId;
        if (!datasourceId && args.datasourcePath) {
          try {
            const datasourceItem = await client.getItemByPath(args.datasourcePath, args.language || 'en');
            datasourceId = datasourceItem.itemId || datasourceItem.id;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
              content: [
                {
                  type: 'text',
                  text: `❌ **Datasource Not Found**

Could not find datasource at path: \`${args.datasourcePath}\`

Error: ${errorMessage}

The page and rendering were found, but the datasource path is invalid.

**Options:**
1. Fix the datasource path and try again
2. Remove the datasourcePath parameter to add the rendering without a datasource
3. Create the datasource first using \`sitecore_create_item\`

💡 Tip: Use \`sitecore_get_item\` with the path to verify the datasource exists.`,
                },
              ],
              isError: true,
            };
          }
        }

        // Default device ID (Default device in Sitecore)
        const deviceId = args.device || '{FE5D7FDF-89C0-4D99-9AA3-B5FDB009C9F3}';
        const cleanDeviceId = deviceId.replace(/[{}]/g, '');

        // Get current page to read existing layout
        const page = await client.getItem(pageId, args.language || 'en');
        
        // Get existing layout XML
        // In XM Cloud, we work with __Final Renderings (final layout)
        // If __Final Renderings is empty, we can start from __Renderings (shared layout) as base
        const finalRenderings = page.fields?.['__Final Renderings'] || '';
        const sharedRenderings = page.fields?.['__Renderings'] || '';
        // Use final renderings if present, otherwise use shared as starting point
        const existingLayoutXml = finalRenderings || sharedRenderings;
        
        // Helper function to extract renderings from content
        function extractRenderings(content: string): string[] {
          const renderings: string[] = [];
          const selfClosingRegex = /<r\s+[^>]*\/>/gi;
          let match;
          while ((match = selfClosingRegex.exec(content)) !== null) {
            renderings.push(match[0].trim());
          }
          return renderings;
        }
        
        // Create new rendering element
        // Format IDs: remove braces and ensure proper GUID format with dashes
        let cleanRenderingId = (renderingId as string).replace(/[{}]/g, '');
        // Format rendering ID with dashes if it's 32 hex chars without dashes
        if (!cleanRenderingId.includes('-') && /^[0-9a-fA-F]{32}$/i.test(cleanRenderingId)) {
          cleanRenderingId = `${cleanRenderingId.substring(0, 8)}-${cleanRenderingId.substring(8, 12)}-${cleanRenderingId.substring(12, 16)}-${cleanRenderingId.substring(16, 20)}-${cleanRenderingId.substring(20)}`;
        }
        
        let cleanDatasourceId: string | null = null;
        if (datasourceId) {
          cleanDatasourceId = (datasourceId as string).replace(/[{}]/g, '');
          // Format datasource ID with dashes if it's 32 hex chars without dashes
          if (!cleanDatasourceId.includes('-') && /^[0-9a-fA-F]{32}$/i.test(cleanDatasourceId)) {
            cleanDatasourceId = `${cleanDatasourceId.substring(0, 8)}-${cleanDatasourceId.substring(8, 12)}-${cleanDatasourceId.substring(12, 16)}-${cleanDatasourceId.substring(16, 20)}-${cleanDatasourceId.substring(20)}`;
          }
        }
        
        const renderingAttrs = [
          `id="${cleanRenderingId}"`,
          `ph="${args.placeholder}"`,
        ];
        if (cleanDatasourceId) {
          renderingAttrs.push(`ds="${cleanDatasourceId}"`);
        }
        if (args.renderingParameters) {
          renderingAttrs.push(`par="${encodeURIComponent(JSON.stringify(args.renderingParameters))}"`);
        }
        const newRendering = `<r ${renderingAttrs.join(' ')} />`;
        
        // Parse and merge renderings with robust XML handling
        let mergedLayoutXml: string;
        
        if (existingLayoutXml && existingLayoutXml.trim().length > 0) {
          // Normalize whitespace but preserve structure
          const normalizedXml = existingLayoutXml.trim().replace(/\s+/g, ' ').replace(/>\s+</g, '><');
          
          // Extract root element - handle various formats
          let rootOpenTag = '<r xmlns:xsd="http://www.w3.org/2001/XMLSchema">';
          let rootContent = '';
          let rootCloseTag = '</r>';
          
          // Try to match root element with attributes
          const rootMatch = normalizedXml.match(/^(<r[^>]*>)(.*)(<\/r>)$/is);
          if (rootMatch) {
            rootOpenTag = rootMatch[1];
            rootContent = rootMatch[2];
            rootCloseTag = rootMatch[3];
          } else if (normalizedXml.startsWith('<r')) {
            // Has root tag but might be malformed
            const rootStart = normalizedXml.indexOf('>');
            if (rootStart > 0) {
              rootOpenTag = normalizedXml.substring(0, rootStart + 1);
              const rootEnd = normalizedXml.lastIndexOf('</r>');
              if (rootEnd > rootStart) {
                rootContent = normalizedXml.substring(rootStart + 1, rootEnd);
                rootCloseTag = '</r>';
              } else {
                rootContent = normalizedXml.substring(rootStart + 1);
              }
            } else {
              rootContent = normalizedXml;
            }
          } else {
            // No root tag - wrap it
            rootContent = normalizedXml;
          }
          
          // Helper function to normalize device ID for comparison (remove braces, normalize format)
          function normalizeDeviceId(deviceId: string): string {
            return deviceId.replace(/[{}]/g, '').replace(/-/g, '').toLowerCase();
          }
          
          // Extract ALL device entries and their renderings
          // This handles cases where there are multiple device entries (e.g., variations of Default device)
          const deviceRegex = /<d\s+id="([^"]+)"([^>]*)>([\s\S]*?)<\/d>/gi;
          const allDevices: Array<{ fullMatch: string; id: string; idNormalized: string; attributes: string; content: string }> = [];
          let deviceMatch;
          
          while ((deviceMatch = deviceRegex.exec(rootContent)) !== null) {
            const deviceId = deviceMatch[1];
            const deviceIdNormalized = normalizeDeviceId(deviceId);
            const targetDeviceIdNormalized = normalizeDeviceId(cleanDeviceId);
            
            allDevices.push({
              fullMatch: deviceMatch[0],
              id: deviceId,
              idNormalized: deviceIdNormalized,
              attributes: deviceMatch[2],
              content: deviceMatch[3],
            });
          }
          
          // Find all devices that match the target device (Default device)
          // This includes exact matches and close variations (e.g., B5FBD vs B5FDB)
          const targetNormalized = normalizeDeviceId(cleanDeviceId);
          const matchingDevices = allDevices.filter(d => {
            // Exact match
            if (d.idNormalized === targetNormalized) {
              return true;
            }
            // Check if it's a variation of the Default device ID
            // Default device: FE5D7FDF-89C0-4D99-9AA3-B5FDB009C9F3
            // Sometimes we see: FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3 (typo/variation)
            // Also handle cases where one has braces and one doesn't
            if (d.idNormalized.length === targetNormalized.length) {
              // Compare first 24 chars (more robust - covers most of the ID before the variation)
              const compareLength = Math.min(24, targetNormalized.length);
              const targetBase = targetNormalized.substring(0, compareLength);
              const deviceBase = d.idNormalized.substring(0, compareLength);
              
              if (targetBase === deviceBase) {
                // Check if the difference is only in the last part (common typo pattern)
                const targetEnd = targetNormalized.substring(compareLength);
                const deviceEnd = d.idNormalized.substring(compareLength);
                // Allow if only 1-3 characters differ (handles B5FBD vs B5FDB and similar variations)
                let diffCount = 0;
                for (let i = 0; i < Math.min(targetEnd.length, deviceEnd.length); i++) {
                  if (targetEnd[i] !== deviceEnd[i]) diffCount++;
                }
                // Also check for character swaps (e.g., "bd" vs "db")
                if (diffCount <= 3) {
                  return true;
                }
              }
              // Also check if they're very similar overall (handles edge cases)
              // Calculate Levenshtein-like similarity for the remaining part
              if (targetBase === deviceBase) {
                const remainingTarget = targetNormalized.substring(compareLength);
                const remainingDevice = d.idNormalized.substring(compareLength);
                // If remaining parts are very similar (allowing for character swaps), consider it a match
                if (remainingTarget.length === remainingDevice.length) {
                  let similarity = 0;
                  for (let i = 0; i < remainingTarget.length; i++) {
                    if (remainingTarget[i] === remainingDevice[i]) {
                      similarity++;
                    }
                  }
                  // If at least 70% of remaining characters match, consider it a variation
                  if (similarity >= remainingTarget.length * 0.7) {
                    return true;
                  }
                }
              }
            }
            return false;
          });
          
          // Collect all renderings from matching devices
          const allRenderings: string[] = [];
          const renderingIdsSeen = new Set<string>();
          
          for (const device of matchingDevices) {
            // Extract self-closing renderings
            const selfClosingRenderings = extractRenderings(device.content);
            for (const rendering of selfClosingRenderings) {
              const idMatch = rendering.match(/id="([^"]+)"/i);
              if (idMatch) {
                const rid = normalizeDeviceId(idMatch[1]);
                if (!renderingIdsSeen.has(rid)) {
                  renderingIdsSeen.add(rid);
                  allRenderings.push(rendering);
                }
              }
            }
            
            // Extract paired tag renderings
            const pairedTagRegex = /<r\s+[^>]*>[\s\S]*?<\/r>/gi;
            let match;
            while ((match = pairedTagRegex.exec(device.content)) !== null) {
              const renderingIdMatch = match[0].match(/id="([^"]+)"/i);
              if (renderingIdMatch) {
                const rid = normalizeDeviceId(renderingIdMatch[1]);
                if (!renderingIdsSeen.has(rid)) {
                  renderingIdsSeen.add(rid);
                  allRenderings.push(match[0].trim());
                }
              }
            }
          }
          
          // Add new rendering if not duplicate
          const normalizedRenderingId = cleanRenderingId.replace(/-/g, '').toLowerCase();
          const renderingIdExists = renderingIdsSeen.has(normalizedRenderingId);
          
          if (!renderingIdExists) {
            allRenderings.push(newRendering);
          } else {
            // Replace existing rendering with new one (to update placeholder/datasource)
            const duplicateIndex = allRenderings.findIndex((r: string) => {
              const idMatch = r.match(/id="([^"]+)"/i);
              if (idMatch) {
                const existingId = normalizeDeviceId(idMatch[1]);
                return existingId === normalizedRenderingId;
              }
              return false;
            });
            if (duplicateIndex >= 0) {
              allRenderings[duplicateIndex] = newRendering;
            }
          }
          
          // Remove all matching device entries from root content
          let cleanedRootContent = rootContent;
          for (const device of matchingDevices) {
            cleanedRootContent = cleanedRootContent.replace(device.fullMatch, '');
          }
          
          // Create a single clean Default device entry with all renderings
          const consolidatedDevice = `<d id="${cleanDeviceId}">${allRenderings.join('')}</d>`;
          
          // Add the consolidated device to the cleaned root content
          mergedLayoutXml = `${rootOpenTag}${cleanedRootContent}${consolidatedDevice}${rootCloseTag}`;
        } else {
          // No existing layout - create new one
          mergedLayoutXml = `<r xmlns:xsd="http://www.w3.org/2001/XMLSchema"><d id="${cleanDeviceId}">${newRendering}</d></r>`;
        }
        
        // Update __Final Renderings field using direct GraphQL mutation
        // This bypasses the updateItem method to avoid schema issues
        const mutation = `
          mutation UpdateLayout($input: UpdateItemInput!) {
            updateItem(input: $input) {
              item {
                itemId
                name
                path
                displayName
              }
            }
          }
        `;
        
        const cleanPageId = (pageId as string).replace(/[{}]/g, '');
        // Format GUID with dashes if needed
        let formattedPageId = cleanPageId;
        if (!formattedPageId.includes('-') && formattedPageId.length === 32) {
          formattedPageId = `${formattedPageId.substring(0, 8)}-${formattedPageId.substring(8, 12)}-${formattedPageId.substring(12, 16)}-${formattedPageId.substring(16, 20)}-${formattedPageId.substring(20)}`;
        }
        
        // Validate the merged XML structure before saving
        // Basic validation: should have root <r> tag and at least one <d> tag
        if (!mergedLayoutXml.includes('<r') || !mergedLayoutXml.includes('<d')) {
          throw new Error(`Invalid XML structure generated. XML: ${mergedLayoutXml.substring(0, 200)}...`);
        }
        
        // Verify the new rendering is in the merged XML
        if (!mergedLayoutXml.includes(`id="${cleanRenderingId}"`) && 
            !mergedLayoutXml.includes(`id="${cleanRenderingId.replace(/-/g, '')}"`)) {
          throw new Error(
            `New rendering was not included in merged XML.\n` +
            `Rendering ID: ${cleanRenderingId}\n` +
            `Merged XML: ${mergedLayoutXml.substring(0, 500)}...`
          );
        }
        
        // Verify placeholder is in the merged XML
        if (!mergedLayoutXml.includes(`ph="${args.placeholder}"`)) {
          throw new Error(
            `Placeholder "${args.placeholder}" was not found in merged XML.\n` +
            `Merged XML: ${mergedLayoutXml.substring(0, 500)}...`
          );
        }
        
        // Verify datasource is in the merged XML if provided
        if (cleanDatasourceId && !mergedLayoutXml.includes(`ds="${cleanDatasourceId}"`) && 
            !mergedLayoutXml.includes(`ds="${cleanDatasourceId.replace(/-/g, '')}"`)) {
          throw new Error(
            `Datasource "${cleanDatasourceId}" was not found in merged XML.\n` +
            `Merged XML: ${mergedLayoutXml.substring(0, 500)}...`
          );
        }
        
        // Always update __Final Renderings for XM Cloud (final layout)
        // This ensures page-specific renderings are stored correctly
        const fieldToUpdate = '__Final Renderings';
        
        const variables = {
          input: {
            itemId: formattedPageId,
            language: args.language || 'en',
            fields: [
              {
                name: fieldToUpdate,
                value: mergedLayoutXml,
              },
            ],
          },
        };
        
        let result;
        try {
          result = await client.executeGraphQL<any>(mutation, variables);
          
          // Check if mutation returned an error
          if (result.errors) {
            throw new Error(`GraphQL mutation failed: ${JSON.stringify(result.errors)}`);
          }
          
          if (!result.updateItem) {
            throw new Error('GraphQL mutation returned no updateItem result');
          }
        } catch (mutationError) {
          const errorMsg = mutationError instanceof Error ? mutationError.message : String(mutationError);
          throw new Error(
            `Failed to update layout XML in Sitecore.\n` +
            `Field: ${fieldToUpdate}\n` +
            `Error: ${errorMsg}\n` +
            `XML being saved (first 500 chars): ${mergedLayoutXml.substring(0, 500)}...`
          );
        }
        
        // Verify the update was successful by reading back the item
        // Wait a brief moment to ensure the update is committed
        await new Promise(resolve => setTimeout(resolve, 500));
        const updatedPage = await client.getItem(pageId, args.language || 'en');
        
        // Verify the rendering was added - check both with and without dashes
        const updatedLayoutXml = updatedPage.fields?.[fieldToUpdate] || '';
        const renderingIdWithoutDashes = cleanRenderingId.replace(/-/g, '');
        const renderingExists = updatedLayoutXml.includes(`id="${cleanRenderingId}"`) || 
                                updatedLayoutXml.includes(`id="${renderingIdWithoutDashes}"`) ||
                                updatedLayoutXml.toLowerCase().includes(`id="${cleanRenderingId.toLowerCase()}"`);
        
        // Also verify placeholder and datasource if specified
        const placeholderExists = updatedLayoutXml.includes(`ph="${args.placeholder}"`);
        const datasourceExists = !cleanDatasourceId || updatedLayoutXml.includes(`ds="${cleanDatasourceId}"`) || 
                                 updatedLayoutXml.includes(`ds="${cleanDatasourceId.replace(/-/g, '')}"`);
        
        if (!renderingExists) {
          // Try to find what renderings are actually in the XML for debugging
          const renderingMatches = updatedLayoutXml.match(/<r\s+[^>]*id="([^"]+)"[^>]*\/?>/gi) || [];
          const renderingIds = renderingMatches.map((m: string) => {
            const idMatch = m.match(/id="([^"]+)"/i);
            return idMatch ? idMatch[1] : 'unknown';
          });
          
          throw new Error(
            `Rendering was not successfully added.\n` +
            `Expected rendering ID: ${cleanRenderingId}\n` +
            `Found rendering IDs in XML: ${renderingIds.join(', ')}\n` +
            `Updated XML (first 1000 chars): ${updatedLayoutXml.substring(0, 1000)}...`
          );
        }
        
        if (!placeholderExists) {
          throw new Error(`Rendering was added but placeholder "${args.placeholder}" was not found in the XML.`);
        }
        
        if (!datasourceExists && cleanDatasourceId) {
          throw new Error(`Rendering was added but datasource "${cleanDatasourceId}" was not found in the XML.`);
        }

        // Get the updated layout XML for verification
        const finalUpdatedLayoutXml = updatedPage.fields?.[fieldToUpdate] || '';
        
        let responseText = `✅ Rendering added to presentation successfully!\n\n`;
        responseText += `📄 Page: ${updatedPage.name} (${updatedPage.path})\n`;
        responseText += `🎨 Rendering ID: ${cleanRenderingId}\n`;
        responseText += `📍 Placeholder: ${args.placeholder}\n`;
        
        if (cleanDatasourceId) {
          responseText += `📊 Datasource ID: ${cleanDatasourceId}\n`;
        }
        
        if (args.renderingParameters) {
          responseText += `⚙️ Parameters: ${Object.keys(args.renderingParameters).length} set\n`;
        }
        
        responseText += `\n✅ Verification:\n`;
        responseText += `- Rendering found in ${fieldToUpdate}: ✅\n`;
        responseText += `- Placeholder "${args.placeholder}" found: ✅\n`;
        if (cleanDatasourceId) {
          responseText += `- Datasource found: ✅\n`;
        }
        
        // Count total renderings in the layout
        const renderingCount = (finalUpdatedLayoutXml.match(/<r\s+[^>]*\/?>/gi) || []).length;
        responseText += `- Total renderings in layout: ${renderingCount}\n`;
        
        responseText += `\nNext steps:\n`;
        responseText += `- View page in Experience Editor to verify the rendering appears\n`;
        responseText += `- Add more renderings: Use sitecore_set_rendering_in_presentation again\n`;
        responseText += `- Update datasource: Use sitecore_update_item\n`;
        responseText += `- Publish: Use sitecore_publish_item\n\n`;
        responseText += `💡 Note: The rendering has been added to ${fieldToUpdate}. If it doesn't appear, check that the page template allows final layout overrides.\n`;

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
    
    // Return detailed, actionable error messages
    let friendlyMessage = `❌ **Rendering Operation Failed**\n\n`;
    friendlyMessage += `**Error:** ${errorMessage}\n\n`;
    
    if (errorMessage.includes('GUID') || errorMessage.includes('guid')) {
      friendlyMessage += `**Issue:** Invalid ID format detected.\n\n`;
      friendlyMessage += `**Solution:** Ensure IDs are valid GUIDs without curly braces.\n`;
      friendlyMessage += `Example: \`110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9\`\n\n`;
      friendlyMessage += `💡 Tip: Use paths instead of IDs when possible (e.g., \`pagePath\` instead of \`pageId\`)`;
    } else if (errorMessage.includes('required') || errorMessage.includes('Required')) {
      friendlyMessage += `**Issue:** Missing required parameters.\n\n`;
      friendlyMessage += `**Required parameters for sitecore_set_rendering_in_presentation:**\n`;
      friendlyMessage += `1. \`placeholder\` - Where to place the rendering (e.g., "headless-main")\n`;
      friendlyMessage += `2. Page: \`pagePath\` OR \`pageId\`\n`;
      friendlyMessage += `3. Rendering: \`renderingPath\` OR \`renderingId\` OR \`renderingName\`\n\n`;
      friendlyMessage += `**Example:**\n`;
      friendlyMessage += `\`\`\`json\n`;
      friendlyMessage += `{\n`;
      friendlyMessage += `  "pagePath": "/sitecore/content/MySite/Home",\n`;
      friendlyMessage += `  "renderingPath": "/sitecore/layout/Renderings/Project/MySite/MyComponent",\n`;
      friendlyMessage += `  "placeholder": "headless-main"\n`;
      friendlyMessage += `}\n`;
      friendlyMessage += `\`\`\``;
    } else if (errorMessage.includes('not found') || errorMessage.includes('Not found')) {
      friendlyMessage += `**Issue:** The requested item was not found in Sitecore.\n\n`;
      friendlyMessage += `**Troubleshooting steps:**\n`;
      friendlyMessage += `1. Verify the path/ID is correct\n`;
      friendlyMessage += `2. Use \`sitecore_get_item\` to check if the item exists\n`;
      friendlyMessage += `3. Use \`sitecore_list_items\` to browse available items\n`;
      friendlyMessage += `4. Check if you have permission to access the item`;
    } else if (errorMessage.includes('GraphQL') || errorMessage.includes('mutation')) {
      friendlyMessage += `**Issue:** Sitecore API error.\n\n`;
      friendlyMessage += `**This could be due to:**\n`;
      friendlyMessage += `1. The item doesn't support presentation details\n`;
      friendlyMessage += `2. Permission issues\n`;
      friendlyMessage += `3. Invalid field values\n\n`;
      friendlyMessage += `💡 Tip: Try using \`sitecore_get_item\` to verify the page exists and has the correct template.`;
    } else {
      friendlyMessage += `**Troubleshooting:**\n`;
      friendlyMessage += `1. Verify all paths and IDs are correct\n`;
      friendlyMessage += `2. Check that the page and rendering exist in Sitecore\n`;
      friendlyMessage += `3. Ensure you have the necessary permissions\n`;
      friendlyMessage += `4. Try using \`sitecore_get_item\` to verify items exist`;
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

