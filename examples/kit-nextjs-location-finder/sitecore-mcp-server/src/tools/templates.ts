/**
 * MCP Tools for Sitecore Template Management
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { SitecoreClient } from '../sitecore-client.js';

export function createTemplateTools(client: SitecoreClient): Tool[] {
  return [
    {
      name: 'sitecore_list_templates',
      description: 'List all Sitecore templates available in the XM Cloud instance',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
    {
      name: 'sitecore_get_template',
      description: 'Get detailed information about a specific Sitecore template by ID or name. You can provide either a template GUID (e.g., "01a618b4-b0a8-4da2-997b-da70400cea7e") or a template name (e.g., "Simple Card Component").',
      inputSchema: {
        type: 'object',
        properties: {
          templateId: {
            type: 'string',
            description: 'The ID (GUID) or name of the template to retrieve. Examples: "01a618b4-b0a8-4da2-997b-da70400cea7e" or "Simple Card Component"',
          },
        },
        required: ['templateId'],
      },
    },
    {
      name: 'sitecore_create_template',
      description: 'Create a new Sitecore template with specified fields and sections. Templates define the structure of content items.',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The name of the template (e.g., "Product", "Blog Post")',
          },
          parent: {
            type: 'string',
            description: 'Parent template folder ID (without curly braces)',
          },
          parentPath: {
            type: 'string',
            description: 'Parent path (alternative to parent ID, e.g., "/sitecore/templates/Project/MyProject")',
          },
          language: {
            type: 'string',
            description: 'Language code (default: "en")',
          },
          icon: {
            type: 'string',
            description: 'Icon path (e.g., "Office/32x32/document.png")',
          },
          sections: {
            type: 'array',
            description: 'Template sections containing fields',
            items: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Section name (e.g., "Content", "Metadata")',
                },
                fields: {
                  type: 'array',
                  description: 'Fields in this section',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', description: 'Field name' },
                      type: { type: 'string', description: 'Field type (e.g., "Single-Line Text", "Rich Text")' },
                      defaultValue: { type: 'string', description: 'Default value' },
                      description: { type: 'string', description: 'Field description' },
                      tooltip: { type: 'string', description: 'Tooltip text' },
                    },
                    required: ['name', 'type'],
                  },
                },
              },
              required: ['name'],
            },
          },
          fields: {
            type: 'array',
            description: 'Simple field list (will be placed in "Data" section if sections not specified)',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                type: { type: 'string' },
                defaultValue: { type: 'string' },
              },
              required: ['name', 'type'],
            },
          },
          baseTemplates: {
            type: 'array',
            description: 'Base template IDs to inherit from',
            items: { type: 'string' },
          },
        },
        required: ['name'],
      },
    },
    {
      name: 'sitecore_update_template',
      description: 'Update an existing Sitecore template (add fields, change name, etc.)',
      inputSchema: {
        type: 'object',
        properties: {
          templateId: {
            type: 'string',
            description: 'The ID of the template to update',
          },
          name: {
            type: 'string',
            description: 'New name for the template (optional)',
          },
          displayName: {
            type: 'string',
            description: 'New display name for the template (optional)',
          },
          fieldsToAdd: {
            type: 'array',
            description: 'New fields to add to the template',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                displayName: { type: 'string' },
                type: { type: 'string' },
                required: { type: 'boolean' },
              },
              required: ['name', 'type'],
            },
          },
        },
        required: ['templateId'],
      },
    },
    {
      name: 'sitecore_delete_template',
      description: 'Delete a Sitecore template by ID',
      inputSchema: {
        type: 'object',
        properties: {
          templateId: {
            type: 'string',
            description: 'The ID of the template to delete',
          },
        },
        required: ['templateId'],
      },
    },
  ];
}

export async function handleTemplateTool(
  toolName: string,
  args: any,
  client: SitecoreClient
): Promise<any> {
  switch (toolName) {
    case 'sitecore_list_templates':
      const templates = await client.getTemplates();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                templates: templates.map((t) => ({
                  id: t.id,
                  name: t.name,
                  displayName: t.displayName,
                  fieldCount: t.fields?.length || 0,
                })),
                count: templates.length,
              },
              null,
              2
            ),
          },
        ],
      };

    case 'sitecore_get_template':
      if (!args.templateId) {
        return {
          content: [
            {
              type: 'text',
              text: 'Please provide a template ID or template name.',
            },
          ],
          isError: true,
        };
      }
      
      try {
        const template = await client.getTemplate(args.templateId);
        return {
          content: [
            {
              type: 'text',
              text: `📄 Template Details:\n\n${JSON.stringify(template, null, 2)}`,
            },
          ],
          isError: false,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        // Return graceful error message without technical details
        const isLanguageError = errorMessage.includes('language') || errorMessage.includes('Language');
        const isNotFoundError = errorMessage.includes('not found') || errorMessage.includes('Not found');
        
        let friendlyMessage = 'Unable to retrieve template. ';
        if (isNotFoundError) {
          friendlyMessage += 'The template was not found. Please verify the template ID or name is correct.';
        } else if (isLanguageError) {
          friendlyMessage += 'There was an issue with the language parameter.';
        } else {
          friendlyMessage += 'Please verify the template ID or name is correct.';
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

    case 'sitecore_create_template':
      if (!args.name) throw new Error('Template name is required');
      if (!args.parent && !args.parentPath) {
        throw new Error('Either parent ID or parentPath must be provided');
      }

      const newTemplate = await client.createTemplate({
        name: args.name,
        parent: args.parent,
        parentPath: args.parentPath,
        language: args.language || 'en',
        icon: args.icon,
        sections: args.sections || (args.fields ? [{
          name: 'Data',
          fields: args.fields
        }] : []),
        baseTemplates: args.baseTemplates,
      });
      
      return {
        content: [
          {
            type: 'text',
            text: `✅ Template "${newTemplate.name}" created successfully!\n\n` +
              `📍 Path: ${newTemplate.fullName}\n` +
              `🆔 ID: ${newTemplate.templateId || newTemplate.id}\n` +
              `🎨 Icon: ${newTemplate.icon || 'Default'}\n\n` +
              `${JSON.stringify(newTemplate, null, 2)}`,
          },
        ],
        isError: false,
      };

    case 'sitecore_update_template':
      const updateSections = args.fieldsToAdd ? [{
        name: 'Data',
        fields: args.fieldsToAdd
      }] : undefined;

      const updatedTemplate = await client.updateTemplate(args.templateId, {
        name: args.name,
        displayName: args.displayName,
        icon: args.icon,
        sections: updateSections,
      });
      return {
        content: [
          {
            type: 'text',
            text: `✅ Template "${updatedTemplate.name}" updated successfully!\n\n${JSON.stringify(updatedTemplate, null, 2)}`,
          },
        ],
        isError: false,
      };

    case 'sitecore_delete_template':
      await client.deleteTemplate(args.templateId);
      return {
        content: [
          {
            type: 'text',
            text: `Template ${args.templateId} deleted successfully.`,
          },
        ],
      };

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

