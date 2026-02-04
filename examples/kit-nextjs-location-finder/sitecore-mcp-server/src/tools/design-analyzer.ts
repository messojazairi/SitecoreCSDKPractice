/**
 * MCP Tools for Sitecore Component Design Analysis
 * 
 * This tool analyzes component designs (images) and recommends
 * appropriate Sitecore template fields to make the component content authorable.
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { SitecoreClient } from '../sitecore-client.js';
import type { MCPToolResponse } from '../types/mcp.js';
import {
  SITECORE_FIELD_TYPES,
  FIELD_TYPE_REFERENCE,
  type AnalyzedField,
  type DesignAnalysisResult,
  type SitecoreFieldType,
} from '../types/sitecore.js';

/**
 * Creates design analyzer tools for MCP server
 * @param client - Sitecore client instance (not used directly but kept for consistency)
 * @returns Array of design analyzer tools
 */
export function createDesignAnalyzerTools(client: SitecoreClient): Tool[] {
  return [
    {
      name: 'sitecore_analyze_component_design',
      description: `Analyze a component design image and recommend Sitecore template fields. 
      
This tool helps determine what fields are needed in a Sitecore template to make a component fully content-authorable.

Provide an image (base64 encoded) of a component design, and optionally describe what the component should do. The tool will analyze the visual elements and suggest appropriate Sitecore field types.

**Supported field types include:**
- Single-Line Text: For titles, headings, labels
- Multi-Line Text: For plain text descriptions
- Rich Text: For formatted content with HTML
- Image: For photos, graphics, icons
- General Link: For CTAs and navigation links
- Number/Integer: For prices, ratings, counts
- Checkbox: For toggles and feature flags
- Date/Datetime: For publication dates, events
- Droplist/Droplink: For single selections
- Multilist/Treelist: For multiple selections
- And more...`,
      inputSchema: {
        type: 'object',
        properties: {
          imageData: {
            type: 'string',
            description: 'Base64 encoded image data of the component design (PNG, JPG, or WebP)',
          },
          imagePath: {
            type: 'string',
            description: 'Alternative: Path to an image file (if imageData not provided)',
          },
          componentName: {
            type: 'string',
            description: 'Suggested name for the component (e.g., "Hero Banner", "Product Card")',
          },
          componentDescription: {
            type: 'string',
            description: 'Description of what the component should do or display',
          },
          additionalContext: {
            type: 'string',
            description: 'Any additional context about the component requirements',
          },
        },
        required: [],
      },
    },
    {
      name: 'sitecore_get_field_types',
      description: `Get a comprehensive list of all available Sitecore field types with descriptions and use cases.
      
Use this tool to understand what field types are available in Sitecore XM Cloud and when to use each type.`,
      inputSchema: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'Filter by category: "text", "media", "link", "selection", "number", "date", or "all"',
            enum: ['text', 'media', 'link', 'selection', 'number', 'date', 'all'],
          },
        },
        required: [],
      },
    },
    {
      name: 'sitecore_suggest_fields_for_element',
      description: `Suggest appropriate Sitecore field type for a specific UI element.
      
Provide a description of a UI element (e.g., "hero title", "call-to-action button", "product image carousel") and get a recommended field type with explanation.`,
      inputSchema: {
        type: 'object',
        properties: {
          elementDescription: {
            type: 'string',
            description: 'Description of the UI element (e.g., "large headline text", "clickable button with icon")',
          },
          isRequired: {
            type: 'boolean',
            description: 'Whether this field should be required for content authors',
          },
          allowMultiple: {
            type: 'boolean',
            description: 'Whether multiple values should be allowed (e.g., multiple images)',
          },
        },
        required: ['elementDescription'],
      },
    },
    {
      name: 'sitecore_generate_template_from_fields',
      description: `Generate a complete Sitecore template definition from a list of analyzed fields.
      
After analyzing a design, use this tool to generate the actual template structure that can be created in Sitecore.`,
      inputSchema: {
        type: 'object',
        properties: {
          componentName: {
            type: 'string',
            description: 'Name of the component/template',
          },
          fields: {
            type: 'array',
            description: 'Array of field definitions',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Field name (PascalCase)' },
                displayName: { type: 'string', description: 'Display name for content authors' },
                type: { type: 'string', description: 'Sitecore field type' },
                section: { type: 'string', description: 'Section to group this field in' },
                required: { type: 'boolean', description: 'Whether field is required' },
                description: { type: 'string', description: 'Help text for content authors' },
                source: { type: 'string', description: 'Source path for selection fields' },
                defaultValue: { type: 'string', description: 'Default value' },
              },
              required: ['name', 'type'],
            },
          },
          parentPath: {
            type: 'string',
            description: 'Parent path for the template (e.g., "/sitecore/templates/Project/MyProject/Components")',
          },
          baseTemplates: {
            type: 'array',
            description: 'Base template IDs to inherit from',
            items: { type: 'string' },
          },
        },
        required: ['componentName', 'fields'],
      },
    },
  ];
}

/**
 * Handle design analyzer tool requests
 * @param toolName - Name of the tool being called
 * @param args - Tool arguments
 * @param client - Sitecore client instance
 * @returns MCP tool response
 */
export async function handleDesignAnalyzerTool(
  toolName: string,
  args: Record<string, any>,
  client: SitecoreClient
): Promise<MCPToolResponse> {
  switch (toolName) {
    case 'sitecore_analyze_component_design':
      return handleAnalyzeComponentDesign(args);

    case 'sitecore_get_field_types':
      return handleGetFieldTypes(args);

    case 'sitecore_suggest_fields_for_element':
      return handleSuggestFieldsForElement(args);

    case 'sitecore_generate_template_from_fields':
      return handleGenerateTemplateFromFields(args);

    default:
      return {
        content: [{ type: 'text', text: `Unknown design analyzer tool: ${toolName}` }],
        isError: true,
      };
  }
}

/**
 * Handle component design analysis
 */
function handleAnalyzeComponentDesign(args: Record<string, any>): MCPToolResponse {
  const { imageData, imagePath, componentName, componentDescription, additionalContext } = args;

  // Build analysis prompt with field type reference
  const fieldTypeGuide = FIELD_TYPE_REFERENCE.map(
    (ft) => `- **${ft.type}**: ${ft.description}\n  Use for: ${ft.useCase}\n  Examples: ${ft.examples.join(', ')}`
  ).join('\n\n');

  const analysisInstructions = `
# Component Design Analysis for Sitecore Template Fields

## Instructions for Analysis

Please analyze the provided component design and identify all content elements that should be authorable by content editors in Sitecore XM Cloud.

${imageData || imagePath ? '**Image provided for analysis.**' : '**No image provided. Please describe the component or provide an image.**'}

${componentName ? `**Component Name:** ${componentName}` : ''}
${componentDescription ? `**Component Description:** ${componentDescription}` : ''}
${additionalContext ? `**Additional Context:** ${additionalContext}` : ''}

## Available Sitecore Field Types

${fieldTypeGuide}

## Analysis Guidelines

When analyzing the design, consider:

1. **Text Elements**: Identify all text that should be editable
   - Headlines/Titles → Single-Line Text
   - Body content with formatting → Rich Text
   - Plain descriptions → Multi-Line Text

2. **Visual Elements**: Identify images and media
   - Photos, graphics → Image
   - Downloadable files → File

3. **Interactive Elements**: Identify links and CTAs
   - Buttons, links → General Link
   - Internal navigation → Internal Link

4. **Data Elements**: Identify numbers, dates, options
   - Prices, ratings → Number
   - Dates → Date or Datetime
   - Options/variants → Droplist or Checkbox

5. **Repeated Elements**: Identify lists or collections
   - Tags, categories → Multilist
   - Related items → Treelist

## Output Format

For each identified element, provide:
- **Field Name** (PascalCase, e.g., "HeroTitle")
- **Display Name** (Human readable, e.g., "Hero Title")
- **Field Type** (From the list above)
- **Section** (Group fields logically: "Content", "Media", "Settings", etc.)
- **Required** (true/false)
- **Description** (Help text for content authors)
- **Reasoning** (Why this field type was chosen)

## Template Structure Recommendations

After listing fields, provide:
1. Suggested template name
2. Recommended section groupings
3. Any base templates to inherit from
4. Best practices for this component type
`;

  return {
    content: [
      {
        type: 'text',
        text: analysisInstructions,
      },
    ],
    isError: false,
    _meta: {
      requiresImageAnalysis: true,
      hasImage: !!(imageData || imagePath),
      fieldTypesAvailable: Object.values(SITECORE_FIELD_TYPES),
    },
  };
}

/**
 * Handle get field types request
 */
function handleGetFieldTypes(args: Record<string, any>): MCPToolResponse {
  const { category = 'all' } = args;

  let filteredTypes = FIELD_TYPE_REFERENCE;

  if (category !== 'all') {
    const categoryMap: Record<string, SitecoreFieldType[]> = {
      text: [
        SITECORE_FIELD_TYPES.SINGLE_LINE_TEXT,
        SITECORE_FIELD_TYPES.MULTI_LINE_TEXT,
        SITECORE_FIELD_TYPES.RICH_TEXT,
      ],
      media: [SITECORE_FIELD_TYPES.IMAGE, SITECORE_FIELD_TYPES.FILE],
      link: [SITECORE_FIELD_TYPES.GENERAL_LINK, SITECORE_FIELD_TYPES.INTERNAL_LINK],
      selection: [
        SITECORE_FIELD_TYPES.DROPLIST,
        SITECORE_FIELD_TYPES.DROPLINK,
        SITECORE_FIELD_TYPES.DROPTREE,
        SITECORE_FIELD_TYPES.MULTILIST,
        SITECORE_FIELD_TYPES.MULTILIST_WITH_SEARCH,
        SITECORE_FIELD_TYPES.TREELIST,
        SITECORE_FIELD_TYPES.CHECKLIST,
      ],
      number: [SITECORE_FIELD_TYPES.NUMBER, SITECORE_FIELD_TYPES.INTEGER],
      date: [SITECORE_FIELD_TYPES.DATE, SITECORE_FIELD_TYPES.DATETIME],
    };

    const allowedTypes = categoryMap[category] || [];
    filteredTypes = FIELD_TYPE_REFERENCE.filter((ft) => allowedTypes.includes(ft.type));
  }

  const output = filteredTypes
    .map(
      (ft) => `## ${ft.type}

**Description:** ${ft.description}

**Use Case:** ${ft.useCase}

**Frontend Component:** \`${ft.frontendComponent}\`

**Examples:**
${ft.examples.map((ex) => `- ${ex}`).join('\n')}
`
    )
    .join('\n---\n\n');

  return {
    content: [
      {
        type: 'text',
        text: `# Sitecore Field Types Reference${category !== 'all' ? ` (${category})` : ''}

${output}

---

## Quick Reference Table

| Field Type | Best For |
|------------|----------|
${filteredTypes.map((ft) => `| ${ft.type} | ${ft.useCase.split(',')[0]} |`).join('\n')}
`,
      },
    ],
    isError: false,
    _meta: {
      category,
      count: filteredTypes.length,
    },
  };
}

/**
 * Handle suggest fields for element request
 */
function handleSuggestFieldsForElement(args: Record<string, any>): MCPToolResponse {
  const { elementDescription, isRequired = false, allowMultiple = false } = args;

  if (!elementDescription) {
    return {
      content: [{ type: 'text', text: 'Please provide an element description.' }],
      isError: true,
    };
  }

  const lowerDesc = elementDescription.toLowerCase();

  // Smart field type detection based on common patterns
  let suggestedType: SitecoreFieldType;
  let reasoning: string;
  let additionalNotes: string[] = [];

  // Image detection
  if (
    lowerDesc.includes('image') ||
    lowerDesc.includes('photo') ||
    lowerDesc.includes('picture') ||
    lowerDesc.includes('thumbnail') ||
    lowerDesc.includes('avatar') ||
    lowerDesc.includes('logo') ||
    lowerDesc.includes('icon') ||
    lowerDesc.includes('graphic') ||
    lowerDesc.includes('banner')
  ) {
    if (allowMultiple) {
      suggestedType = SITECORE_FIELD_TYPES.MULTILIST;
      reasoning = 'Multiple images can be selected from the Media Library using Multilist with a source pointing to the media folder.';
      additionalNotes.push('Set source to: /sitecore/media library/Project/[YourProject]/Images');
    } else {
      suggestedType = SITECORE_FIELD_TYPES.IMAGE;
      reasoning = 'Image field allows content authors to select images from the Media Library with alt text support.';
    }
  }
  // Link/Button detection
  else if (
    lowerDesc.includes('button') ||
    lowerDesc.includes('cta') ||
    lowerDesc.includes('call to action') ||
    lowerDesc.includes('link') ||
    lowerDesc.includes('url') ||
    lowerDesc.includes('navigation')
  ) {
    suggestedType = SITECORE_FIELD_TYPES.GENERAL_LINK;
    reasoning = 'General Link supports internal pages, external URLs, media files, and anchors with customizable link text and target.';
    additionalNotes.push('Supports: Internal Link, External URL, Media Link, Anchor, Email, JavaScript');
  }
  // Rich text detection
  else if (
    lowerDesc.includes('body') ||
    lowerDesc.includes('content') ||
    lowerDesc.includes('article') ||
    lowerDesc.includes('description') ||
    lowerDesc.includes('paragraph') ||
    lowerDesc.includes('formatted') ||
    lowerDesc.includes('html') ||
    lowerDesc.includes('rich')
  ) {
    suggestedType = SITECORE_FIELD_TYPES.RICH_TEXT;
    reasoning = 'Rich Text provides a WYSIWYG editor for formatted content including headings, lists, links, and inline images.';
    additionalNotes.push('Content authors can format text, add links, and embed media');
  }
  // Title/Heading detection
  else if (
    lowerDesc.includes('title') ||
    lowerDesc.includes('heading') ||
    lowerDesc.includes('headline') ||
    lowerDesc.includes('name') ||
    lowerDesc.includes('label') ||
    lowerDesc.includes('caption')
  ) {
    suggestedType = SITECORE_FIELD_TYPES.SINGLE_LINE_TEXT;
    reasoning = 'Single-Line Text is ideal for short text content like titles and headings (up to 256 characters).';
  }
  // Date detection
  else if (lowerDesc.includes('date') || lowerDesc.includes('published') || lowerDesc.includes('event')) {
    if (lowerDesc.includes('time') || lowerDesc.includes('schedule')) {
      suggestedType = SITECORE_FIELD_TYPES.DATETIME;
      reasoning = 'Datetime field captures both date and time, ideal for events or scheduled content.';
    } else {
      suggestedType = SITECORE_FIELD_TYPES.DATE;
      reasoning = 'Date field captures date without time, ideal for publication dates or event dates.';
    }
  }
  // Number detection
  else if (
    lowerDesc.includes('price') ||
    lowerDesc.includes('cost') ||
    lowerDesc.includes('rating') ||
    lowerDesc.includes('percentage') ||
    lowerDesc.includes('decimal')
  ) {
    suggestedType = SITECORE_FIELD_TYPES.NUMBER;
    reasoning = 'Number field stores decimal values, ideal for prices, ratings, or percentages.';
  }
  // Integer detection
  else if (
    lowerDesc.includes('count') ||
    lowerDesc.includes('quantity') ||
    lowerDesc.includes('order') ||
    lowerDesc.includes('year') ||
    lowerDesc.includes('number of')
  ) {
    suggestedType = SITECORE_FIELD_TYPES.INTEGER;
    reasoning = 'Integer field stores whole numbers, ideal for counts, quantities, or sort order.';
  }
  // Boolean detection
  else if (
    lowerDesc.includes('toggle') ||
    lowerDesc.includes('checkbox') ||
    lowerDesc.includes('show') ||
    lowerDesc.includes('hide') ||
    lowerDesc.includes('enable') ||
    lowerDesc.includes('disable') ||
    lowerDesc.includes('featured') ||
    lowerDesc.includes('active')
  ) {
    suggestedType = SITECORE_FIELD_TYPES.CHECKBOX;
    reasoning = 'Checkbox provides a simple on/off toggle for feature flags or visibility settings.';
  }
  // Selection detection
  else if (
    lowerDesc.includes('category') ||
    lowerDesc.includes('tag') ||
    lowerDesc.includes('select') ||
    lowerDesc.includes('choose') ||
    lowerDesc.includes('option')
  ) {
    if (allowMultiple) {
      suggestedType = SITECORE_FIELD_TYPES.MULTILIST;
      reasoning = 'Multilist allows selecting multiple items from a defined source, ideal for tags or categories.';
      additionalNotes.push('Requires a source path to the items that can be selected');
    } else {
      suggestedType = SITECORE_FIELD_TYPES.DROPLINK;
      reasoning = 'Droplink allows selecting a single item from a defined source, ideal for category or author selection.';
      additionalNotes.push('Requires a source path to the items that can be selected');
    }
  }
  // File detection
  else if (
    lowerDesc.includes('file') ||
    lowerDesc.includes('download') ||
    lowerDesc.includes('pdf') ||
    lowerDesc.includes('document') ||
    lowerDesc.includes('attachment')
  ) {
    suggestedType = SITECORE_FIELD_TYPES.FILE;
    reasoning = 'File field allows selecting downloadable files from the Media Library.';
  }
  // Default to Single-Line Text
  else {
    suggestedType = SITECORE_FIELD_TYPES.SINGLE_LINE_TEXT;
    reasoning = 'Single-Line Text is a safe default for short text content. Consider Rich Text if formatting is needed.';
    additionalNotes.push('If longer formatted content is needed, consider using Rich Text instead');
  }

  // Find the full field type metadata
  const fieldMetadata = FIELD_TYPE_REFERENCE.find((ft) => ft.type === suggestedType);

  return {
    content: [
      {
        type: 'text',
        text: `# Field Suggestion for: "${elementDescription}"

## Recommended Field Type

**Type:** ${suggestedType}

**Reasoning:** ${reasoning}

${fieldMetadata ? `**Frontend Component:** \`${fieldMetadata.frontendComponent}\`` : ''}

**Required:** ${isRequired ? 'Yes' : 'No'}
**Allow Multiple:** ${allowMultiple ? 'Yes' : 'No'}

${additionalNotes.length > 0 ? `## Additional Notes\n${additionalNotes.map((n) => `- ${n}`).join('\n')}` : ''}

## Example Field Definition

\`\`\`json
{
  "name": "${toPascalCase(elementDescription)}",
  "displayName": "${toDisplayName(elementDescription)}",
  "type": "${suggestedType}",
  "required": ${isRequired},
  "description": "Enter the ${elementDescription.toLowerCase()}"
}
\`\`\`
`,
      },
    ],
    isError: false,
    _meta: {
      suggestedType,
      elementDescription,
    },
  };
}

/**
 * Handle generate template from fields request
 */
function handleGenerateTemplateFromFields(args: Record<string, any>): MCPToolResponse {
  const { componentName, fields, parentPath, baseTemplates } = args;

  if (!componentName || !fields || fields.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: 'Please provide a componentName and at least one field definition.',
        },
      ],
      isError: true,
    };
  }

  // Group fields by section
  const sectionMap: Record<string, any[]> = {};
  for (const field of fields) {
    const section = field.section || 'Content';
    if (!sectionMap[section]) {
      sectionMap[section] = [];
    }
    sectionMap[section].push(field);
  }

  // Build sections array
  const sections = Object.entries(sectionMap).map(([sectionName, sectionFields]) => ({
    name: sectionName,
    fields: sectionFields.map((f) => ({
      name: f.name,
      displayName: f.displayName || f.name,
      type: f.type,
      description: f.description || '',
      source: f.source || '',
      defaultValue: f.defaultValue || '',
      required: f.required || false,
    })),
  }));

  // Generate the template definition
  const templateDefinition = {
    name: toPascalCase(componentName),
    displayName: componentName,
    parentPath: parentPath || '/sitecore/templates/Project/[YourProject]/Components',
    icon: 'Office/32x32/document.png',
    baseTemplates: baseTemplates || [],
    sections,
  };

  // Generate field summary
  const fieldSummary = fields
    .map((f: any) => `| ${f.name} | ${f.type} | ${f.section || 'Content'} | ${f.required ? '✓' : ''} |`)
    .join('\n');

  return {
    content: [
      {
        type: 'text',
        text: `# Generated Template: ${componentName}

## Template Overview

**Name:** ${templateDefinition.name}
**Display Name:** ${templateDefinition.displayName}
**Parent Path:** ${templateDefinition.parentPath}
**Total Fields:** ${fields.length}
**Sections:** ${Object.keys(sectionMap).join(', ')}

## Field Summary

| Field Name | Type | Section | Required |
|------------|------|---------|----------|
${fieldSummary}

## Complete Template Definition

Use this with the \`sitecore_create_template\` tool:

\`\`\`json
${JSON.stringify(templateDefinition, null, 2)}
\`\`\`

## Create Template Command

To create this template in Sitecore, use:

\`\`\`
Tool: sitecore_create_template
Arguments:
  name: "${templateDefinition.name}"
  parentPath: "${templateDefinition.parentPath}"
  sections: ${JSON.stringify(sections, null, 2)}
\`\`\`

## Next Steps

1. Verify the parent path exists in your Sitecore instance
2. Create the template using \`sitecore_create_template\`
3. Create standard values if needed
4. Set up datasource location for the component
5. Create a rendering item for the component
`,
      },
    ],
    isError: false,
    _meta: {
      templateDefinition,
      fieldCount: fields.length,
      sectionCount: Object.keys(sectionMap).length,
    },
  };
}

/**
 * Convert string to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split(/[\s-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Convert string to display name
 */
function toDisplayName(str: string): string {
  return str
    .split(/[\s-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
