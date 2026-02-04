/**
 * Sitecore Best Practices Utility
 * 
 * This module provides validation rules and best practices enforcement for Sitecore item operations.
 * It ensures items are created with proper folder structure, naming conventions, and icons.
 */

import { ValidationError } from './validators.js';

/**
 * Sitecore icon mappings based on item type/purpose
 * These are standard Sitecore icons that should be used for consistency
 */
export const SITECORE_ICONS = {
  // Folder icons
  FOLDER: 'Office/32x32/folder.png',
  FOLDER_OPEN: 'Office/32x32/folder_open.png',
  FOLDER_BLUE: 'Office/32x32/folder_blue.png',
  FOLDER_GREEN: 'Office/32x32/folder_green.png',
  FOLDER_YELLOW: 'Office/32x32/folder_yellow.png',
  
  // Content icons
  CONTENT_PAGE: 'Office/32x32/document.png',
  ARTICLE: 'Office/32x32/newspaper.png',
  BLOG_POST: 'Office/32x32/blog.png',
  NEWS: 'Office/32x32/news.png',
  
  // Media icons
  IMAGE: 'Office/32x32/photo_landscape.png',
  VIDEO: 'Office/32x32/video.png',
  DOCUMENT: 'Office/32x32/document_text.png',
  PDF: 'Office/32x32/document_pdf.png',
  
  // Component icons
  COMPONENT: 'Office/32x32/cube_blue.png',
  WIDGET: 'Office/32x32/window.png',
  MODULE: 'Office/32x32/module.png',
  
  // Data icons
  DATA_SOURCE: 'Office/32x32/data.png',
  DATA_FOLDER: 'Office/32x32/data_folder.png',
  DICTIONARY: 'Office/32x32/book_open.png',
  
  // Navigation icons
  NAVIGATION: 'Office/32x32/navigate.png',
  MENU: 'Office/32x32/menu.png',
  LINK: 'Office/32x32/link.png',
  
  // Settings icons
  SETTINGS: 'Office/32x32/gear.png',
  CONFIGURATION: 'Office/32x32/preferences.png',
  
  // User/People icons
  USER: 'Office/32x32/user.png',
  PEOPLE: 'Office/32x32/people.png',
  AUTHOR: 'Office/32x32/businessperson.png',
  
  // Location icons
  LOCATION: 'Office/32x32/map_pin.png',
  STORE: 'Office/32x32/building.png',
  REGION: 'Office/32x32/globe.png',
  
  // Product icons
  PRODUCT: 'Office/32x32/box.png',
  CATEGORY: 'Office/32x32/tags.png',
  
  // Event icons
  EVENT: 'Office/32x32/calendar.png',
  SCHEDULE: 'Office/32x32/clock.png',
  
  // Form icons
  FORM: 'Office/32x32/form.png',
  INPUT: 'Office/32x32/textbox.png',
  
  // Default
  DEFAULT: 'Office/32x32/document.png',
} as const;

/**
 * Content tree structure paths that are valid for content creation
 * Items should only be created under these paths, not at root level
 */
export const VALID_CONTENT_PATHS = {
  // Main content areas
  CONTENT: '/sitecore/content',
  MEDIA_LIBRARY: '/sitecore/media library',
  TEMPLATES: '/sitecore/templates',
  
  // Content sub-paths (items must be at least 2 levels deep under content)
  MIN_CONTENT_DEPTH: 3, // e.g., /sitecore/content/SiteName/...
  
  // Paths where items should NOT be created directly
  SYSTEM_PATHS: [
    '/sitecore/system',
    '/sitecore/layout',
    '/sitecore/client',
  ],
  
  // Protected paths that require special handling
  PROTECTED_PATHS: [
    '/sitecore/templates/System',
    '/sitecore/templates/Common',
    '/sitecore/templates/Branches',
  ],
} as const;

/**
 * Naming convention rules for Sitecore items
 */
export const NAMING_CONVENTIONS = {
  // Characters that are not allowed in item names
  INVALID_CHARACTERS: /[<>:"|?*\\\/\#\@\!\$\%\^\&\(\)\+\=\[\]\{\}\;\'\`\~]/,
  
  // Maximum length for item names
  MAX_NAME_LENGTH: 100,
  
  // Minimum length for item names
  MIN_NAME_LENGTH: 1,
  
  // Reserved names that should not be used
  RESERVED_NAMES: [
    'null',
    'undefined',
    'true',
    'false',
    'default',
    'new',
    'delete',
    'edit',
    'create',
  ],
  
  // Recommended naming patterns
  PATTERNS: {
    // PascalCase for templates
    TEMPLATE: /^[A-Z][a-zA-Z0-9]*$/,
    // kebab-case or PascalCase for content items
    CONTENT_ITEM: /^[a-zA-Z][a-zA-Z0-9\s\-_]*$/,
    // Folder names
    FOLDER: /^[a-zA-Z][a-zA-Z0-9\s\-_]*$/,
  },
} as const;

/**
 * Template to icon mapping for automatic icon selection
 */
export const TEMPLATE_ICON_MAP: Record<string, string> = {
  // Standard Sitecore templates
  'folder': SITECORE_ICONS.FOLDER,
  'common folder': SITECORE_ICONS.FOLDER,
  'node': SITECORE_ICONS.FOLDER,
  
  // Content templates
  'page': SITECORE_ICONS.CONTENT_PAGE,
  'article': SITECORE_ICONS.ARTICLE,
  'article page': SITECORE_ICONS.ARTICLE,
  'blog post': SITECORE_ICONS.BLOG_POST,
  'news': SITECORE_ICONS.NEWS,
  'news item': SITECORE_ICONS.NEWS,
  
  // Data source templates
  'data source': SITECORE_ICONS.DATA_SOURCE,
  'datasource': SITECORE_ICONS.DATA_SOURCE,
  'data folder': SITECORE_ICONS.DATA_FOLDER,
  
  // Component templates
  'component': SITECORE_ICONS.COMPONENT,
  'rendering': SITECORE_ICONS.COMPONENT,
  'widget': SITECORE_ICONS.WIDGET,
  
  // Media templates
  'image': SITECORE_ICONS.IMAGE,
  'jpeg': SITECORE_ICONS.IMAGE,
  'png': SITECORE_ICONS.IMAGE,
  'video': SITECORE_ICONS.VIDEO,
  'document': SITECORE_ICONS.DOCUMENT,
  'pdf': SITECORE_ICONS.PDF,
  
  // Navigation templates
  'navigation': SITECORE_ICONS.NAVIGATION,
  'navigation item': SITECORE_ICONS.NAVIGATION,
  'menu': SITECORE_ICONS.MENU,
  'link': SITECORE_ICONS.LINK,
  
  // Location templates
  'location': SITECORE_ICONS.LOCATION,
  'store': SITECORE_ICONS.STORE,
  'region': SITECORE_ICONS.REGION,
  
  // Product templates
  'product': SITECORE_ICONS.PRODUCT,
  'category': SITECORE_ICONS.CATEGORY,
  
  // People templates
  'author': SITECORE_ICONS.AUTHOR,
  'user': SITECORE_ICONS.USER,
  'person': SITECORE_ICONS.PEOPLE,
  
  // Event templates
  'event': SITECORE_ICONS.EVENT,
  'calendar': SITECORE_ICONS.EVENT,
  
  // Dictionary templates
  'dictionary': SITECORE_ICONS.DICTIONARY,
  'dictionary entry': SITECORE_ICONS.DICTIONARY,
  
  // Settings templates
  'settings': SITECORE_ICONS.SETTINGS,
  'configuration': SITECORE_ICONS.CONFIGURATION,
};

/**
 * Best practice validation result
 */
export interface BestPracticeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  recommendedIcon?: string;
}

/**
 * Item creation context for validation
 */
export interface ItemCreationContext {
  name: string;
  templateId?: string;
  templateName?: string;
  parentPath?: string;
  parentId?: string;
  fields?: Array<{ name: string; value: string }>;
}

/**
 * Validates if the parent path follows proper folder structure
 * Items should not be created directly under /sitecore/content, they need proper folder hierarchy
 * 
 * @param parentPath - The path where the item will be created
 * @returns Validation result with errors, warnings, and suggestions
 */
export function validateFolderStructure(parentPath: string): BestPracticeValidationResult {
  const result: BestPracticeValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: [],
  };

  if (!parentPath) {
    result.isValid = false;
    result.errors.push('Parent path is required. Items must be created within a proper folder structure.');
    result.suggestions.push('Specify a parent path like /sitecore/content/YourSite/Data/YourFolder');
    return result;
  }

  // Normalize path
  const normalizedPath = parentPath.toLowerCase().trim();

  // Check if trying to create directly under root paths
  if (normalizedPath === '/sitecore' || normalizedPath === '/sitecore/') {
    result.isValid = false;
    result.errors.push('Cannot create items directly under /sitecore. Use a proper content folder structure.');
    result.suggestions.push('Create items under /sitecore/content/YourSite/... or /sitecore/media library/...');
    return result;
  }

  // Check system paths
  for (const systemPath of VALID_CONTENT_PATHS.SYSTEM_PATHS) {
    if (normalizedPath.startsWith(systemPath.toLowerCase())) {
      result.warnings.push(`Creating items under ${systemPath} is not recommended for content items.`);
      result.suggestions.push('Consider using /sitecore/content/... for content items instead.');
    }
  }

  // Check protected paths
  for (const protectedPath of VALID_CONTENT_PATHS.PROTECTED_PATHS) {
    if (normalizedPath.startsWith(protectedPath.toLowerCase())) {
      result.warnings.push(`Path ${protectedPath} contains system templates. Be careful when creating items here.`);
    }
  }

  // Validate depth for content items
  if (normalizedPath.startsWith('/sitecore/content')) {
    const pathSegments = parentPath.split('/').filter(s => s.length > 0);
    
    // Check minimum depth: /sitecore/content/SiteName = 3 segments
    if (pathSegments.length < VALID_CONTENT_PATHS.MIN_CONTENT_DEPTH) {
      result.isValid = false;
      result.errors.push(
        `Items should not be created directly under /sitecore/content. ` +
        `Create a proper folder structure first (e.g., /sitecore/content/SiteName/Data/Folder).`
      );
      result.suggestions.push(
        'Follow this structure: /sitecore/content/[SiteName]/[ContentArea]/[Folder]/[Item]',
        'Example: /sitecore/content/MySite/Data/Articles/ArticleFolder'
      );
      return result;
    }

    // Suggest proper organization if creating content items
    if (pathSegments.length === VALID_CONTENT_PATHS.MIN_CONTENT_DEPTH) {
      result.warnings.push(
        'Consider organizing content in sub-folders for better content management.'
      );
      result.suggestions.push(
        'Recommended structure: /sitecore/content/[SiteName]/[ContentType]/[Category]/[Items]',
        'Examples:',
        '  - /sitecore/content/MySite/Articles/2024/January/',
        '  - /sitecore/content/MySite/Products/Electronics/Phones/',
        '  - /sitecore/content/MySite/Locations/NorthAmerica/USA/'
      );
    }
  }

  // Check for media library structure
  if (normalizedPath.startsWith('/sitecore/media library')) {
    const pathSegments = parentPath.split('/').filter(s => s.length > 0);
    
    if (pathSegments.length < 3) {
      result.warnings.push(
        'Organize media in folders for better management.'
      );
      result.suggestions.push(
        'Recommended: /sitecore/media library/[Project]/[Category]/[Subcategory]',
        'Example: /sitecore/media library/MySite/Images/Heroes/'
      );
    }
  }

  return result;
}

/**
 * Validates item name against Sitecore best practices
 * 
 * @param name - The item name to validate
 * @returns Validation result with errors, warnings, and suggestions
 */
export function validateItemName(name: string): BestPracticeValidationResult {
  const result: BestPracticeValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: [],
  };

  if (!name || name.trim().length === 0) {
    result.isValid = false;
    result.errors.push('Item name is required and cannot be empty.');
    return result;
  }

  const trimmedName = name.trim();

  // Check length
  if (trimmedName.length < NAMING_CONVENTIONS.MIN_NAME_LENGTH) {
    result.isValid = false;
    result.errors.push(`Item name must be at least ${NAMING_CONVENTIONS.MIN_NAME_LENGTH} character(s).`);
  }

  if (trimmedName.length > NAMING_CONVENTIONS.MAX_NAME_LENGTH) {
    result.isValid = false;
    result.errors.push(
      `Item name exceeds maximum length of ${NAMING_CONVENTIONS.MAX_NAME_LENGTH} characters. ` +
      `Current length: ${trimmedName.length}`
    );
    result.suggestions.push('Consider shortening the name or using abbreviations.');
  }

  // Check for invalid characters
  if (NAMING_CONVENTIONS.INVALID_CHARACTERS.test(trimmedName)) {
    result.isValid = false;
    const invalidChars = trimmedName.match(NAMING_CONVENTIONS.INVALID_CHARACTERS);
    result.errors.push(
      `Item name contains invalid characters: ${[...new Set(invalidChars)].join(', ')}. ` +
      `Use only letters, numbers, spaces, hyphens, and underscores.`
    );
  }

  // Check for reserved names
  const lowerName = trimmedName.toLowerCase();
  const isReserved = (NAMING_CONVENTIONS.RESERVED_NAMES as readonly string[]).includes(lowerName);
  if (isReserved) {
    result.isValid = false;
    result.errors.push(
      `"${trimmedName}" is a reserved name and cannot be used. ` +
      `Reserved names: ${NAMING_CONVENTIONS.RESERVED_NAMES.join(', ')}`
    );
  }

  // Check for leading/trailing spaces
  if (name !== trimmedName) {
    result.warnings.push('Item name has leading or trailing spaces which will be trimmed.');
  }

  // Check for multiple consecutive spaces
  if (/\s{2,}/.test(trimmedName)) {
    result.warnings.push('Item name contains multiple consecutive spaces. Consider using single spaces.');
  }

  // Check for starting with number
  if (/^\d/.test(trimmedName)) {
    result.warnings.push(
      'Item name starts with a number. Consider starting with a letter for better organization.'
    );
    result.suggestions.push(`Example: "Item ${trimmedName}" or "Article ${trimmedName}"`);
  }

  // Check for all uppercase
  if (trimmedName === trimmedName.toUpperCase() && trimmedName.length > 3) {
    result.warnings.push('Item name is all uppercase. Consider using Title Case for readability.');
    result.suggestions.push(`Suggested: "${toTitleCase(trimmedName)}"`);
  }

  return result;
}

/**
 * Gets recommended icon based on template name or item context
 * 
 * @param templateName - The template name to match
 * @param itemName - Optional item name for additional context
 * @returns Recommended icon path
 */
export function getRecommendedIcon(templateName?: string, itemName?: string): string {
  if (!templateName) {
    return SITECORE_ICONS.DEFAULT;
  }

  const normalizedTemplate = templateName.toLowerCase().trim();

  // Direct match from template map
  if (TEMPLATE_ICON_MAP[normalizedTemplate]) {
    return TEMPLATE_ICON_MAP[normalizedTemplate];
  }

  // Partial match - check if template name contains key words
  for (const [key, icon] of Object.entries(TEMPLATE_ICON_MAP)) {
    if (normalizedTemplate.includes(key) || key.includes(normalizedTemplate)) {
      return icon;
    }
  }

  // Try to infer from item name if template didn't match
  if (itemName) {
    const normalizedName = itemName.toLowerCase();
    
    if (normalizedName.includes('folder') || normalizedName.includes('directory')) {
      return SITECORE_ICONS.FOLDER;
    }
    if (normalizedName.includes('article') || normalizedName.includes('post')) {
      return SITECORE_ICONS.ARTICLE;
    }
    if (normalizedName.includes('product')) {
      return SITECORE_ICONS.PRODUCT;
    }
    if (normalizedName.includes('category')) {
      return SITECORE_ICONS.CATEGORY;
    }
    if (normalizedName.includes('location') || normalizedName.includes('store')) {
      return SITECORE_ICONS.LOCATION;
    }
    if (normalizedName.includes('event') || normalizedName.includes('calendar')) {
      return SITECORE_ICONS.EVENT;
    }
    if (normalizedName.includes('author') || normalizedName.includes('user')) {
      return SITECORE_ICONS.AUTHOR;
    }
    if (normalizedName.includes('image') || normalizedName.includes('photo')) {
      return SITECORE_ICONS.IMAGE;
    }
    if (normalizedName.includes('video')) {
      return SITECORE_ICONS.VIDEO;
    }
    if (normalizedName.includes('document') || normalizedName.includes('file')) {
      return SITECORE_ICONS.DOCUMENT;
    }
    if (normalizedName.includes('data') || normalizedName.includes('datasource')) {
      return SITECORE_ICONS.DATA_SOURCE;
    }
    if (normalizedName.includes('settings') || normalizedName.includes('config')) {
      return SITECORE_ICONS.SETTINGS;
    }
    if (normalizedName.includes('navigation') || normalizedName.includes('menu')) {
      return SITECORE_ICONS.NAVIGATION;
    }
  }

  return SITECORE_ICONS.DEFAULT;
}

/**
 * Validates complete item creation context against all best practices
 * 
 * @param context - The item creation context to validate
 * @returns Complete validation result with all checks
 */
export function validateItemCreation(context: ItemCreationContext): BestPracticeValidationResult {
  const result: BestPracticeValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: [],
  };

  // Validate item name
  const nameValidation = validateItemName(context.name);
  result.errors.push(...nameValidation.errors);
  result.warnings.push(...nameValidation.warnings);
  result.suggestions.push(...nameValidation.suggestions);
  if (!nameValidation.isValid) {
    result.isValid = false;
  }

  // Validate folder structure if parent path provided
  if (context.parentPath) {
    const folderValidation = validateFolderStructure(context.parentPath);
    result.errors.push(...folderValidation.errors);
    result.warnings.push(...folderValidation.warnings);
    result.suggestions.push(...folderValidation.suggestions);
    if (!folderValidation.isValid) {
      result.isValid = false;
    }
  } else if (!context.parentId) {
    result.isValid = false;
    result.errors.push(
      'Either parentPath or parentId must be provided. ' +
      'Items cannot be created without a parent location.'
    );
    result.suggestions.push(
      'Provide parentPath like /sitecore/content/MySite/Data/Folder',
      'Or provide the parentId of an existing folder item'
    );
  }

  // Get recommended icon
  result.recommendedIcon = getRecommendedIcon(context.templateName, context.name);

  // Add icon suggestion if we found one
  if (result.recommendedIcon !== SITECORE_ICONS.DEFAULT) {
    result.suggestions.push(`Recommended icon for this item type: ${result.recommendedIcon}`);
  }

  // Validate fields if provided
  if (context.fields && context.fields.length > 0) {
    const fieldValidation = validateFields(context.fields);
    result.warnings.push(...fieldValidation.warnings);
    result.suggestions.push(...fieldValidation.suggestions);
  }

  // Add general best practice suggestions
  addGeneralBestPractices(result, context);

  return result;
}

/**
 * Validates field values for common issues
 * 
 * @param fields - Array of field name/value pairs
 * @returns Validation result for fields
 */
export function validateFields(
  fields: Array<{ name: string; value: string }>
): BestPracticeValidationResult {
  const result: BestPracticeValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: [],
  };

  for (const field of fields) {
    // Check for empty field names
    if (!field.name || field.name.trim().length === 0) {
      result.warnings.push('Field with empty name detected. Ensure all fields have valid names.');
    }

    // Check for very long field values
    if (field.value && field.value.length > 10000) {
      result.warnings.push(
        `Field "${field.name}" has a very long value (${field.value.length} characters). ` +
        `Consider if this is intended.`
      );
    }

    // Check for potential HTML injection in non-rich-text contexts
    if (field.value && /<script/i.test(field.value)) {
      result.warnings.push(
        `Field "${field.name}" contains script tags. ` +
        `Ensure this is a Rich Text field and content is sanitized.`
      );
    }

    // Check for common field naming issues
    const normalizedFieldName = field.name.toLowerCase();
    if (normalizedFieldName === 'title' && (!field.value || field.value.trim().length === 0)) {
      result.warnings.push('Title field is empty. Consider providing a meaningful title.');
    }
  }

  return result;
}

/**
 * Adds general best practice suggestions based on context
 * 
 * @param result - The validation result to add suggestions to
 * @param context - The item creation context
 */
function addGeneralBestPractices(
  result: BestPracticeValidationResult,
  context: ItemCreationContext
): void {
  // Suggest creating display name if not provided
  const hasDisplayNameField = context.fields?.some(
    f => f.name.toLowerCase() === 'displayname' || f.name.toLowerCase() === '__display name'
  );
  
  if (!hasDisplayNameField && context.name) {
    result.suggestions.push(
      `Consider setting a Display Name field for better Content Editor experience. ` +
      `Suggested: "${toDisplayName(context.name)}"`
    );
  }

  // Suggest proper content organization
  if (context.parentPath) {
    const pathDepth = context.parentPath.split('/').filter(s => s.length > 0).length;
    if (pathDepth > 8) {
      result.warnings.push(
        'Content tree depth is quite deep. Consider restructuring for easier navigation.'
      );
    }
  }

  // Template-specific suggestions
  if (context.templateName) {
    const templateLower = context.templateName.toLowerCase();
    
    if (templateLower.includes('page')) {
      result.suggestions.push(
        'For page items, ensure you set metadata fields like Title, Description for SEO.'
      );
    }
    
    if (templateLower.includes('folder')) {
      result.suggestions.push(
        'Folder items should follow a consistent naming convention across your project.'
      );
    }
    
    if (templateLower.includes('datasource') || templateLower.includes('data source')) {
      result.suggestions.push(
        'Data source items should be organized in a dedicated Data folder under your site.'
      );
    }
  }
}

/**
 * Converts string to Title Case
 * 
 * @param str - String to convert
 * @returns Title case string
 */
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Converts item name to a suitable display name
 * 
 * @param name - Item name to convert
 * @returns Display name
 */
function toDisplayName(name: string): string {
  // Replace hyphens and underscores with spaces
  let displayName = name.replace(/[-_]/g, ' ');
  
  // Add spaces before capital letters (for PascalCase)
  displayName = displayName.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  // Convert to title case
  return toTitleCase(displayName);
}

/**
 * Generates a suggested folder structure for a given content type
 * 
 * @param siteName - The site name
 * @param contentType - The type of content (e.g., 'articles', 'products', 'locations')
 * @returns Suggested folder path
 */
export function suggestFolderStructure(siteName: string, contentType: string): string {
  const normalizedType = contentType.toLowerCase().trim();
  
  const contentTypeMap: Record<string, string> = {
    article: 'Articles',
    articles: 'Articles',
    blog: 'Blog',
    news: 'News',
    product: 'Products',
    products: 'Products',
    location: 'Locations',
    locations: 'Locations',
    store: 'Stores',
    stores: 'Stores',
    event: 'Events',
    events: 'Events',
    category: 'Categories',
    categories: 'Categories',
    author: 'Authors',
    authors: 'Authors',
    page: 'Pages',
    pages: 'Pages',
    data: 'Data',
    datasource: 'Data',
    component: 'Components',
    components: 'Components',
    media: 'Media',
    image: 'Images',
    images: 'Images',
    document: 'Documents',
    documents: 'Documents',
  };

  const folderName = contentTypeMap[normalizedType] || toTitleCase(contentType);
  
  return `/sitecore/content/${siteName}/${folderName}`;
}

/**
 * Checks if a path represents a folder-type item
 * 
 * @param templateName - The template name to check
 * @returns True if this is likely a folder template
 */
export function isFolderTemplate(templateName?: string): boolean {
  if (!templateName) return false;
  
  const normalizedName = templateName.toLowerCase();
  const folderKeywords = ['folder', 'node', 'directory', 'container', 'bucket'];
  
  return folderKeywords.some(keyword => normalizedName.includes(keyword));
}

/**
 * Gets the content area type from a path
 * 
 * @param path - The Sitecore path
 * @returns The content area type or null
 */
export function getContentAreaFromPath(path: string): string | null {
  if (!path) return null;
  
  const normalizedPath = path.toLowerCase();
  
  if (normalizedPath.includes('/data/') || normalizedPath.includes('/datasources/')) {
    return 'Data';
  }
  if (normalizedPath.includes('/articles/')) {
    return 'Articles';
  }
  if (normalizedPath.includes('/products/')) {
    return 'Products';
  }
  if (normalizedPath.includes('/locations/')) {
    return 'Locations';
  }
  if (normalizedPath.includes('/events/')) {
    return 'Events';
  }
  if (normalizedPath.includes('/pages/')) {
    return 'Pages';
  }
  if (normalizedPath.includes('/media/') || normalizedPath.includes('/images/')) {
    return 'Media';
  }
  if (normalizedPath.includes('/settings/') || normalizedPath.includes('/configuration/')) {
    return 'Settings';
  }
  
  return null;
}

/**
 * Formats validation result as a user-friendly message
 * 
 * @param result - The validation result to format
 * @returns Formatted message string
 */
export function formatValidationResult(result: BestPracticeValidationResult): string {
  const lines: string[] = [];
  
  if (result.errors.length > 0) {
    lines.push('❌ **Validation Errors:**');
    result.errors.forEach(error => lines.push(`   - ${error}`));
    lines.push('');
  }
  
  if (result.warnings.length > 0) {
    lines.push('⚠️ **Warnings:**');
    result.warnings.forEach(warning => lines.push(`   - ${warning}`));
    lines.push('');
  }
  
  if (result.suggestions.length > 0) {
    lines.push('💡 **Suggestions:**');
    result.suggestions.forEach(suggestion => lines.push(`   - ${suggestion}`));
    lines.push('');
  }
  
  if (result.recommendedIcon) {
    lines.push(`🎨 **Recommended Icon:** ${result.recommendedIcon}`);
  }
  
  if (result.isValid && result.errors.length === 0) {
    lines.unshift('✅ **Validation Passed**\n');
  }
  
  return lines.join('\n');
}
