/**
 * Prompts Aggregator - Centralized export of all MCP prompts
 */

import { Prompt, GetPromptResult } from '@modelcontextprotocol/sdk/types.js';
import type { SitecoreClient } from '../sitecore-client.js';
import type { MCPPromptResponse } from '../types/mcp.js';

/**
 * Create all prompts
 */
export function createAllPrompts(client: SitecoreClient): Prompt[] {
  return [
    // ========== MULTI-STEP WORKFLOW PROMPTS ==========
    {
      name: 'figma-to-sitecore-workflow',
      description: '🎨 Complete workflow: Convert Figma design to Sitecore (identify fields → create template → create rendering → data source)',
      arguments: [
        {
          name: 'componentName',
          description: 'Name of the component from Figma (e.g., "Hero Banner", "Card Component")',
          required: true,
        },
        {
          name: 'figmaUrl',
          description: 'Figma design URL or description',
          required: false,
        },
        {
          name: 'siteName',
          description: 'Target Sitecore site name (default: "Project")',
          required: false,
        },
      ],
    },
    {
      name: 'create-component-full-workflow',
      description: '⚡ Complete workflow: Create component from scratch (template → rendering → data source → sample content)',
      arguments: [
        {
          name: 'componentName',
          description: 'Name of the component (e.g., "Hero Banner", "Feature Card")',
          required: true,
        },
        {
          name: 'fields',
          description: 'Comma-separated list of fields (e.g., "Title,Description,Image,Link")',
          required: false,
        },
        {
          name: 'siteName',
          description: 'Target Sitecore site name (default: "Project")',
          required: false,
        },
      ],
    },
    {
      name: 'create-page-full-workflow',
      description: '📄 Complete workflow: Create page with components (page template → page item → add components → publish)',
      arguments: [
        {
          name: 'pageName',
          description: 'Name of the page (e.g., "Home", "About Us", "Product Detail")',
          required: true,
        },
        {
          name: 'parentPath',
          description: 'Parent page path (default: "/sitecore/content/[Site]/Home")',
          required: false,
        },
        {
          name: 'components',
          description: 'Comma-separated list of components to add (e.g., "Hero,Features,CTA")',
          required: false,
        },
      ],
    },
    {
      name: 'migrate-component-workflow',
      description: '🔄 Complete workflow: Migrate existing component to new structure (analyze → backup → create new → migrate data → validate)',
      arguments: [
        {
          name: 'oldComponentPath',
          description: 'Path to existing component template',
          required: true,
        },
        {
          name: 'newComponentName',
          description: 'Name for the new component',
          required: true,
        },
      ],
    },
    {
      name: 'site-setup-workflow',
      description: '🏗️ Complete workflow: Set up new site from scratch (structure → templates → sample pages → publish)',
      arguments: [
        {
          name: 'siteName',
          description: 'Name of the new site',
          required: true,
        },
        {
          name: 'includeComponents',
          description: 'Create common components (default: true)',
          required: false,
        },
      ],
    },

    // ========== SIMPLE SINGLE-STEP PROMPTS ==========
    {
      name: 'create-component-template',
      description: 'Create a new component template with common fields for web components',
      arguments: [
        {
          name: 'componentName',
          description: 'Name of the component (e.g., "Hero Banner", "Card Component")',
          required: true,
        },
        {
          name: 'parentPath',
          description: 'Parent template folder path (default: /sitecore/templates/Project/Components)',
          required: false,
        },
      ],
    },
    {
      name: 'create-page-template', 
      description: 'Create a new page template with standard page fields',
      arguments: [
        {
          name: 'pageName',
          description: 'Name of the page template (e.g., "Article Page", "Product Page")',
          required: true,
        },
        {
          name: 'parentPath',
          description: 'Parent template folder path (default: /sitecore/templates/Project/Pages)',
          required: false,
        },
      ],
    },
    {
      name: 'create-content-structure',
      description: 'Create a complete content structure with folder hierarchy',
      arguments: [
        {
          name: 'siteName',
          description: 'Name of the site (e.g., "MySite")',
          required: true,
        },
        {
          name: 'includeMedia',
          description: 'Create media library folders (default: true)',
          required: false,
        },
      ],
    },
    {
      name: 'bulk-publish-site',
      description: 'Publish an entire site including all pages, media, and dependencies',
      arguments: [
        {
          name: 'sitePath',
          description: 'Root path of the site (e.g., "/sitecore/content/MySite")',
          required: true,
        },
        {
          name: 'language',
          description: 'Language to publish (default: "en")',
          required: false,
        },
      ],
    },
  ];
}

/**
 * Handle prompt get requests
 */
export async function handlePromptGet(
  promptName: string,
  args: Record<string, string>,
  client: SitecoreClient
): Promise<GetPromptResult> {
  try {
    switch (promptName) {
      // ========== MULTI-STEP WORKFLOW PROMPTS ==========
      
      case 'figma-to-sitecore-workflow': {
        const componentName = args.componentName;
        const figmaUrl = args.figmaUrl || 'the provided Figma design';
        const siteName = args.siteName || 'Project';

        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `🎨 FIGMA TO SITECORE - COMPLETE WORKFLOW

Component: ${componentName}
Design Source: ${figmaUrl}
Target Site: ${siteName}

⚠️ IMPORTANT: If you encounter "circuit breaker is OPEN" errors, use the sitecore_reset_circuit_breaker tool to reset it.

This is a multi-step workflow. Execute each step in order and mark as complete before moving to the next.
Add a 1-2 second delay between steps to prevent rate limiting.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: ANALYZE DESIGN & IDENTIFY FIELDS
□ Task: Analyze the Figma design and identify all required fields
□ Action: Review the design and list all content fields needed
□ Expected Output: List of fields with their types (e.g., Title: Single-Line Text, Description: Multi-Line Text, Image: Image, Link: General Link, etc.)
□ Tool: Manual analysis or Figma MCP if available

STEP 2: CREATE COMPONENT TEMPLATE IN SITECORE
□ Task: Create the component template with identified fields
□ Action: Use sitecore_create_template tool
□ Wait: Add 1-2 second delay before this step
□ Parameters:
  - name: "${componentName}"
  - parentPath: "/sitecore/templates/${siteName}/Components"
  - icon: "Office/32x32/component.png"
  - sections: Based on fields from Step 1
□ Validation: Verify template was created successfully

STEP 3: CREATE RENDERING DEFINITION
□ Task: Create the rendering item for this component
□ Action: Use sitecore_create_rendering tool
□ Wait: Add 1-2 second delay before this step
□ Parameters:
  - name: "${componentName}"
  - componentTemplateName: "${componentName}"
  - parentPath: "/sitecore/layout/Renderings/${siteName}/Components"
  - datasourceTemplate: (use template ID from Step 2)
  - cacheable: true
□ Validation: Verify rendering was created

STEP 4: CREATE DATA SOURCE LOCATION
□ Task: Set up data source location for content authors
□ Action: Use sitecore_create_item tool
□ Wait: Add 1-2 second delay before this step
□ Parameters:
  - name: "${componentName}s"
  - templateId: "{A87A00B1-E6DB-45AB-8B54-636FEC3B5523}" (Folder template)
  - parentPath: "/sitecore/content/${siteName}/Data"
□ Purpose: This folder will hold all instances of this component

STEP 5: CREATE SAMPLE DATA SOURCE ITEM
□ Task: Create a sample data source item for testing
□ Action: Use sitecore_create_item tool
□ Wait: Add 1-2 second delay before this step
□ Parameters:
  - name: "Sample ${componentName}"
  - templateId: (use template ID from Step 2)
  - parentPath: "/sitecore/content/${siteName}/Data/${componentName}s"
  - fields: Populate with sample content
□ Validation: Verify item created with correct field values

STEP 6: VERIFY AND DOCUMENT
□ Task: Final verification and documentation
□ Actions:
  - Verify template has all required fields
  - Verify rendering is properly configured
  - Verify data source location exists
  - Document paths and IDs for reference
□ Output: Summary of all created items with their paths and IDs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please execute each step in order and mark with ✅ when complete.`,
              },
            },
          ],
        };
      }

      case 'create-component-full-workflow': {
        const componentName = args.componentName;
        const fields = args.fields || 'Title,Description,Image,Link';
        const siteName = args.siteName || 'Project';

        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `⚡ CREATE COMPONENT - COMPLETE WORKFLOW

Component: ${componentName}
Fields: ${fields}
Target Site: ${siteName}

Execute these steps in order:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: DEFINE FIELD STRUCTURE
□ Task: Map fields to Sitecore field types
□ Fields to create: ${fields}
□ Action: Determine appropriate field types for each:
  - Title → Single-Line Text
  - Description → Multi-Line Text or Rich Text
  - Image → Image
  - Link → General Link
  - Custom fields as appropriate
□ Output: Structured field list with types

STEP 2: CREATE COMPONENT TEMPLATE
□ Task: Create template with all fields
□ Action: Use sitecore_create_template
□ Parameters:
  - name: "${componentName}"
  - parentPath: "/sitecore/templates/${siteName}/Components"
  - sections: [
      {
        name: "Content",
        fields: [/* fields from Step 1 */]
      },
      {
        name: "Styling",
        fields: [{ name: "CSS Class", type: "Single-Line Text" }]
      }
    ]
  - icon: "Office/32x32/component.png"
□ Save: templateId for next steps

STEP 3: CREATE RENDERING ITEM
□ Task: Create rendering definition
□ Action: Use sitecore_create_rendering
□ Parameters:
  - name: "${componentName}"
  - componentTemplateName: "${componentName}"
  - parentPath: "/sitecore/layout/Renderings/${siteName}/Components"
  - datasourceTemplate: (templateId from Step 2)
  - datasourceLocation: "/sitecore/content/${siteName}/Data/${componentName}s"
  - cacheable: true
□ Save: renderingId for reference

STEP 4: CREATE DATA SOURCE FOLDER
□ Task: Set up content location
□ Action: Use sitecore_create_item
□ Parameters:
  - name: "${componentName}s"
  - templateId: "{A87A00B1-E6DB-45AB-8B54-636FEC3B5523}"
  - parentPath: "/sitecore/content/${siteName}/Data"

STEP 5: CREATE SAMPLE CONTENT
□ Task: Create 2-3 sample data source items
□ Action: Use sitecore_create_item (repeat for each sample)
□ Parameters:
  - name: "Sample ${componentName} 1", "Sample ${componentName} 2", etc.
  - templateId: (from Step 2)
  - parentPath: "/sitecore/content/${siteName}/Data/${componentName}s"
  - fields: Populate with realistic sample data

STEP 6: PUBLISH TO WEB
□ Task: Publish all created items
□ Action: Use sitecore_publish_item
□ Items to publish:
  - Template (Step 2)
  - Rendering (Step 3)
  - Data folder (Step 4)
  - Sample items (Step 5)
□ Parameters: targets: ["web"], language: "en"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Execute step-by-step and mark each with ✅ when complete.`,
              },
            },
          ],
        };
      }

      case 'create-page-full-workflow': {
        const pageName = args.pageName;
        const parentPath = args.parentPath || '/sitecore/content/[Site]/Home';
        const components = args.components || 'Hero,Features,CTA';

        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `📄 CREATE PAGE - COMPLETE WORKFLOW

Page: ${pageName}
Parent: ${parentPath}
Components to add: ${components}

Execute these steps in order:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: CREATE PAGE TEMPLATE
□ Task: Create page template with SEO and content fields
□ Action: Use sitecore_create_template
□ Parameters:
  - name: "${pageName}"
  - parentPath: "/sitecore/templates/Project/Pages"
  - baseTemplates: ["{1930BBEB-7805-471A-A3BE-4858AC7CF696}"] (Standard Template)
  - sections: [
      {
        name: "SEO",
        fields: [
          { name: "Page Title", type: "Single-Line Text" },
          { name: "Meta Description", type: "Multi-Line Text" },
          { name: "Meta Keywords", type: "Single-Line Text" }
        ]
      },
      {
        name: "Content",
        fields: [
          { name: "Page Heading", type: "Single-Line Text" },
          { name: "Content", type: "Rich Text" }
        ]
      }
    ]
□ Save: templateId

STEP 2: CREATE PAGE ITEM
□ Task: Create the actual page item
□ Action: Use sitecore_create_item
□ Parameters:
  - name: "${pageName}"
  - templateId: (from Step 1)
  - parentPath: "${parentPath}"
  - fields: [
      { name: "Page Title", value: "${pageName}" },
      { name: "Page Heading", value: "${pageName}" }
    ]
□ Save: pageId

STEP 3: ADD COMPONENTS TO PAGE
□ Task: Add each component to the page layout
□ Components: ${components.split(',').map(c => `\n  - ${c.trim()}`).join('')}
□ Action: For each component, use sitecore_set_rendering_in_presentation
□ Parameters:
  - pageId: (from Step 2)
  - renderingName: (component name)
  - placeholder: "main" (or appropriate placeholder)
  - Create data source for each if needed

STEP 4: SET PRESENTATION DETAILS
□ Task: Configure layout and presentation
□ Action: Verify layout is properly set
□ Validation:
  - All components are visible in Experience Editor
  - Placeholders are correctly configured
  - Data sources are properly linked

STEP 5: PUBLISH PAGE
□ Task: Publish the page and all related items
□ Action: Use sitecore_publish_tree
□ Parameters:
  - rootPath: (page path from Step 2)
  - deep: true
  - targets: ["web"]
  - language: "en"

STEP 6: VERIFY LIVE PAGE
□ Task: Verification and documentation
□ Actions:
  - Confirm page is published to web database
  - Verify all components render correctly
  - Document page path and URL
  - Note any issues or next steps

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Execute each step and mark with ✅ when complete.`,
              },
            },
          ],
        };
      }

      case 'migrate-component-workflow': {
        const oldComponentPath = args.oldComponentPath;
        const newComponentName = args.newComponentName;

        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `🔄 MIGRATE COMPONENT - COMPLETE WORKFLOW

Old Component: ${oldComponentPath}
New Component: ${newComponentName}

Execute these steps carefully:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: ANALYZE EXISTING COMPONENT
□ Task: Get details of the old component
□ Action: Use sitecore_get_item
□ Parameters:
  - path: "${oldComponentPath}"
  - includeChildren: true
□ Document:
  - All field names and types
  - Field sections
  - Any base templates
  - Current usage locations

STEP 2: BACKUP EXISTING COMPONENT
□ Task: Create backup for safety
□ Action: Use sitecore_copy_item
□ Parameters:
  - path: "${oldComponentPath}"
  - targetParentPath: "/sitecore/templates/Archive"
  - name: "${newComponentName}_Backup_[DATE]"
□ Validation: Verify backup exists

STEP 3: CREATE NEW COMPONENT TEMPLATE
□ Task: Create improved version
□ Action: Use sitecore_create_template
□ Parameters:
  - name: "${newComponentName}"
  - parentPath: (same as old component parent)
  - sections: (from Step 1, with improvements)
  - baseTemplates: (from Step 1)
□ Save: newTemplateId

STEP 4: GET ALL COMPONENT INSTANCES
□ Task: Find all items using old component
□ Action: Use sitecore_get_item_references
□ Parameters:
  - path: "${oldComponentPath}"
□ Document: List of all items to migrate

STEP 5: MIGRATE CONTENT DATA
□ Task: Update each instance to use new template
□ Action: For each item from Step 4:
  1. Get current field values
  2. Update template to new one
  3. Set field values
  4. Verify data integrity
□ Validation: Compare old vs new for each item

STEP 6: UPDATE RENDERINGS
□ Task: Update rendering definitions to use new template
□ Action: Search and update all renderings
□ Parameters: Update datasourceTemplate to newTemplateId

STEP 7: TESTING & VALIDATION
□ Task: Comprehensive validation
□ Actions:
  - Test rendering in Experience Editor
  - Verify all fields display correctly
  - Check all migrated items
  - Test on sample pages
□ Document: Any issues found

STEP 8: PUBLISH CHANGES
□ Task: Publish all changes to web
□ Action: Use sitecore_publish_item for:
  - New template
  - All migrated items
  - Updated renderings
□ Validation: Verify live site works correctly

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  IMPORTANT: Do not delete old component until fully validated!

Execute each step carefully and mark with ✅ when complete.`,
              },
            },
          ],
        };
      }

      case 'site-setup-workflow': {
        const siteName = args.siteName;
        const includeComponents = args.includeComponents !== 'false';

        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `🏗️ SITE SETUP - COMPLETE WORKFLOW

Site Name: ${siteName}
Include Components: ${includeComponents}

Execute these steps to set up a complete new site:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: CREATE TEMPLATE FOLDERS
□ Task: Set up template organization structure
□ Actions: Create folder structure:
  - /sitecore/templates/${siteName}
  - /sitecore/templates/${siteName}/Pages
  - /sitecore/templates/${siteName}/Components
  - /sitecore/templates/${siteName}/Data
□ Tool: sitecore_create_item with Folder template

STEP 2: CREATE CONTENT STRUCTURE
□ Task: Set up content tree
□ Actions: Create:
  - /sitecore/content/${siteName}
  - /sitecore/content/${siteName}/Home
  - /sitecore/content/${siteName}/Data
  - /sitecore/content/${siteName}/Settings
□ Tool: sitecore_create_item

STEP 3: CREATE MEDIA LIBRARY
□ Task: Set up media folders
□ Actions: Create:
  - /sitecore/media library/${siteName}
  - /sitecore/media library/${siteName}/Images
  - /sitecore/media library/${siteName}/Documents
  - /sitecore/media library/${siteName}/Videos
□ Tool: sitecore_create_item

STEP 4: CREATE LAYOUT STRUCTURE
□ Task: Set up rendering folders
□ Actions: Create:
  - /sitecore/layout/Renderings/${siteName}
  - /sitecore/layout/Renderings/${siteName}/Pages
  - /sitecore/layout/Renderings/${siteName}/Components
□ Tool: sitecore_create_item

${includeComponents ? `
STEP 5: CREATE COMMON COMPONENT TEMPLATES
□ Task: Create reusable component templates
□ Components to create:
  1. Hero Banner (Title, Subtitle, Image, CTA)
  2. Feature Card (Icon, Title, Description, Link)
  3. CTA Block (Heading, Text, Button)
  4. Image with Text (Image, Heading, Content)
□ Tool: sitecore_create_template for each

STEP 6: CREATE COMPONENT RENDERINGS
□ Task: Create rendering items for each component
□ Action: Use sitecore_create_rendering for each component
□ Configure data source templates and locations

STEP 7: CREATE DATA FOLDERS FOR COMPONENTS
□ Task: Set up data source locations
□ Actions: For each component create:
  - /sitecore/content/${siteName}/Data/[ComponentName]s
□ Tool: sitecore_create_item
` : ''}

STEP ${includeComponents ? '8' : '5'}: CREATE HOME PAGE TEMPLATE
□ Task: Create home page template
□ Action: Use sitecore_create_template
□ Parameters:
  - name: "Home Page"
  - parentPath: "/sitecore/templates/${siteName}/Pages"
  - Standard page fields + specific home page fields

STEP ${includeComponents ? '9' : '6'}: CONFIGURE HOME PAGE
□ Task: Set up the home page item
□ Action: Update /sitecore/content/${siteName}/Home
□ Set template to Home Page template
□ Add basic content fields

${includeComponents ? `
STEP 10: ADD COMPONENTS TO HOME PAGE
□ Task: Add sample components to demonstrate
□ Action: Use sitecore_set_rendering_in_presentation
□ Add Hero, Features, and CTA to home page
□ Create sample data sources for each
` : ''}

STEP ${includeComponents ? '11' : '7'}: PUBLISH ENTIRE SITE
□ Task: Publish everything to web database
□ Action: Use sitecore_publish_tree
□ Parameters:
  - rootPath: "/sitecore/content/${siteName}"
  - deep: true
  - targets: ["web"]
  - Also publish templates and layout items

STEP ${includeComponents ? '12' : '8'}: DOCUMENTATION & VERIFICATION
□ Task: Document and verify setup
□ Actions:
  - Document all paths and IDs
  - Create site structure diagram
  - Verify all items published
  - Test home page rendering
  - Note any configuration needed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This creates a complete site structure ready for content authoring.

Execute each step in order and mark with ✅ when complete.`,
              },
            },
          ],
        };
      }

      // ========== SIMPLE SINGLE-STEP PROMPTS ==========
      
      case 'create-component-template': {
        const componentName = args.componentName;
        const parentPath = args.parentPath || '/sitecore/templates/Project/Components';

        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Create a new Sitecore component template with the following specifications:

Template Name: ${componentName}
Parent Path: ${parentPath}

Include these common component fields:
1. Title (Single-Line Text) - Component heading
2. Description (Multi-Line Text) - Component description
3. Image (Image) - Component image
4. Link (General Link) - Component CTA link
5. CSS Class (Single-Line Text) - Additional CSS classes

Organize fields in sections:
- Content: Title, Description, Image, Link
- Styling: CSS Class

Use icon: Office/32x32/component.png

Please create this template using the sitecore_create_template tool.`,
              },
            },
          ],
        };
      }

      case 'create-page-template': {
        const pageName = args.pageName;
        const parentPath = args.parentPath || '/sitecore/templates/Project/Pages';

        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Create a new Sitecore page template with the following specifications:

Template Name: ${pageName}
Parent Path: ${parentPath}

Include these standard page fields:
1. Page Title (Single-Line Text) - Browser title
2. Meta Description (Multi-Line Text) - SEO meta description
3. Meta Keywords (Single-Line Text) - SEO keywords
4. Page Heading (Single-Line Text) - H1 heading
5. Content (Rich Text) - Main page content
6. Hide From Navigation (Checkbox) - Hide page from menus

Organize fields in sections:
- SEO: Page Title, Meta Description, Meta Keywords
- Content: Page Heading, Content
- Settings: Hide From Navigation

Use icon: Office/32x32/document.png

Please create this template using the sitecore_create_template tool.`,
              },
            },
          ],
        };
      }

      case 'create-content-structure': {
        const siteName = args.siteName;
        const includeMedia = args.includeMedia !== 'false';

        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Create a complete content structure for a new Sitecore site:

Site Name: ${siteName}

Create the following folder structure:

1. Content Structure:
   - /sitecore/content/${siteName} (root folder)
   - /sitecore/content/${siteName}/Home (home page)
   - /sitecore/content/${siteName}/Data (data folder)
   - /sitecore/content/${siteName}/Settings (settings folder)

${includeMedia ? `2. Media Library Structure:
   - /sitecore/media library/${siteName} (media root)
   - /sitecore/media library/${siteName}/Images
   - /sitecore/media library/${siteName}/Documents
   - /sitecore/media library/${siteName}/Videos` : ''}

Please create this structure using the appropriate sitecore_create_item tools.`,
              },
            },
          ],
        };
      }

      case 'bulk-publish-site': {
        const sitePath = args.sitePath;
        const language = args.language || 'en';

        return {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Publish the entire site to production:

Site Path: ${sitePath}
Language: ${language}
Mode: Deep publish (include all descendants)
Target: web database

Steps:
1. Use sitecore_publish_tree tool with rootPath: ${sitePath}
2. Set deep: true to publish all pages and content
3. Use language: ${language}
4. Target databases: ["web"]

This will publish all content items under ${sitePath} to the live website.

Please execute the publish operation using the sitecore_publish_tree tool.`,
              },
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown prompt: ${promptName}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate prompt: ${errorMessage}`);
  }
}

/**
 * Get prompt categories
 */
export function getPromptCategories(): string[] {
  return ['workflows', 'templates', 'content', 'publishing'];
}

/**
 * Get prompts by category
 */
export function getPromptsByCategory(
  category: string,
  client: SitecoreClient
): Prompt[] {
  const allPrompts = createAllPrompts(client);
  
  switch (category) {
    case 'workflows':
      return allPrompts.filter(p => 
        p.name.includes('workflow')
      );
    case 'templates':
      return allPrompts.filter(p => 
        p.name.includes('template') && !p.name.includes('workflow')
      );
    case 'content':
      return allPrompts.filter(p => 
        (p.name.includes('content') || p.name.includes('structure')) && !p.name.includes('workflow')
      );
    case 'publishing':
      return allPrompts.filter(p => 
        p.name.includes('publish') && !p.name.includes('workflow')
      );
    default:
      return [];
  }
}

/**
 * Get prompt count
 */
export function getPromptStats(): Record<string, number> {
  return {
    workflows: 5,
    templates: 2,
    content: 1,
    publishing: 1,
    total: 9,
  };
}

// Export for backward compatibility
export { createAllPrompts as createPrompts };

