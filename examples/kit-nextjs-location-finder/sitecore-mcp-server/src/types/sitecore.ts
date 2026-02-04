/**
 * Sitecore API Types
 */

export interface SitecoreConfig {
  instanceUrl: string;
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  oauthTokenUrl?: string;
  oauthAudience?: string;
  apiVersion?: string;
  timeout?: number;
}

export interface SitecoreTemplate {
  id: string;
  templateId?: string;
  name: string;
  displayName?: string;
  fullName?: string;
  icon?: string;
  fields?: SitecoreField[];
  sections?: SitecoreTemplateSection[];
  baseTemplates?: Array<{ templateId: string; name: string }>;
  created?: string;
  updated?: string;
}

export interface SitecoreTemplateSection {
  id?: string;
  name: string;
  icon?: string;
  sortOrder?: number;
  fields?: SitecoreField[];
}

export interface SitecoreField {
  id?: string;
  name: string;
  displayName?: string;
  type: string; // e.g., "Single-Line Text", "Rich Text", "Number", etc.
  defaultValue?: string;
  description?: string;
  tooltip?: string;
  source?: string;
  validation?: string;
  required?: boolean;
  shared?: boolean;
  unversioned?: boolean;
}

export interface SitecoreItem {
  id: string;
  itemId?: string;
  name: string;
  displayName?: string;
  templateId: string;
  templateName?: string;
  path: string;
  language?: string;
  version?: number;
  fields?: Record<string, any>;
  children?: SitecoreItem[];
  hasChildren?: boolean;
  created?: string;
  updated?: string;
}

export interface SitecoreApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    statusCode?: number;
  };
}

// Template Requests
export interface CreateTemplateRequest {
  name: string;
  parent: string; // Parent ID without braces
  parentPath?: string;
  language?: string;
  icon?: string;
  sections?: TemplateSectionInput[];
  baseTemplates?: string[];
  createStandardValuesItem?: boolean;
}

export interface TemplateSectionInput {
  name: string;
  icon?: string;
  sortOrder?: number;
  fields?: TemplateFieldInput[];
}

export interface TemplateFieldInput {
  name: string;
  type: string;
  defaultValue?: string;
  description?: string;
  tooltip?: string;
  source?: string;
  validation?: string;
  shared?: boolean;
  unversioned?: boolean;
}

export interface UpdateTemplateRequest {
  name?: string;
  displayName?: string;
  icon?: string;
  sections?: TemplateSectionInput[];
  baseTemplates?: string[];
}

// Item Requests
export interface CreateItemRequest {
  name: string;
  templateId: string;
  parent?: string;
  parentPath?: string;
  language?: string;
  fields?: ItemFieldInput[];
}

export interface ItemFieldInput {
  name: string;
  value: string;
}

export interface UpdateItemRequest {
  name?: string;
  displayName?: string;
  language?: string;
  fields?: ItemFieldInput[];
}

export interface MoveItemRequest {
  targetParentId: string;
}

export interface CopyItemRequest {
  targetParentId: string;
  newName?: string;
}

// Publishing Requests
export interface PublishItemRequest {
  itemId: string;
  language?: string;
  targets?: string[];
  deep?: boolean;
}

export interface PublishTreeRequest {
  rootItemId: string;
  language?: string;
  targets?: string[];
}

// Media Requests
export interface UploadMediaRequest {
  name: string;
  parentPath: string;
  fileData: string; // Base64 encoded
  mimeType: string;
}

// GraphQL Types
export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: GraphQLError[];
}

export interface GraphQLError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: string[];
  extensions?: Record<string, any>;
}

/**
 * Sitecore Field Type Definitions
 * These are the standard field types available in Sitecore XM Cloud
 */
export const SITECORE_FIELD_TYPES = {
  // Simple Types
  SINGLE_LINE_TEXT: 'Single-Line Text',
  MULTI_LINE_TEXT: 'Multi-Line Text',
  RICH_TEXT: 'Rich Text',
  NUMBER: 'Number',
  INTEGER: 'Integer',
  CHECKBOX: 'Checkbox',
  DATE: 'Date',
  DATETIME: 'Datetime',

  // Link Types
  GENERAL_LINK: 'General Link',
  INTERNAL_LINK: 'Internal Link',

  // Media Types
  IMAGE: 'Image',
  FILE: 'File',

  // Selection Types
  DROPLIST: 'Droplist',
  DROPLINK: 'Droplink',
  DROPTREE: 'Droptree',
  CHECKLIST: 'Checklist',
  MULTILIST: 'Multilist',
  MULTILIST_WITH_SEARCH: 'Multilist with Search',
  TREELIST: 'Treelist',
  TREELIST_EX: 'TreelistEx',

  // Reference Types
  GROUPED_DROPLINK: 'Grouped Droplink',
  GROUPED_DROPLIST: 'Grouped Droplist',

  // Advanced Types
  NAME_VALUE_LIST: 'Name Value List',
  NAME_LOOKUP_VALUE_LIST: 'Name Lookup Value List',
} as const;

export type SitecoreFieldType = typeof SITECORE_FIELD_TYPES[keyof typeof SITECORE_FIELD_TYPES];

/**
 * Field type metadata for analysis recommendations
 */
export interface FieldTypeMetadata {
  type: SitecoreFieldType;
  description: string;
  useCase: string;
  frontendComponent: string;
  examples: string[];
}

/**
 * Comprehensive field type reference for design analysis
 */
export const FIELD_TYPE_REFERENCE: FieldTypeMetadata[] = [
  {
    type: SITECORE_FIELD_TYPES.SINGLE_LINE_TEXT,
    description: 'Short text content up to 256 characters',
    useCase: 'Titles, headings, labels, names, short descriptions',
    frontendComponent: 'Text',
    examples: ['Hero Title', 'Button Label', 'Card Title', 'Navigation Link Text'],
  },
  {
    type: SITECORE_FIELD_TYPES.MULTI_LINE_TEXT,
    description: 'Plain text content with multiple lines, no formatting',
    useCase: 'Descriptions, summaries, plain text content without HTML',
    frontendComponent: 'Text',
    examples: ['Meta Description', 'Alt Text', 'Plain Text Summary'],
  },
  {
    type: SITECORE_FIELD_TYPES.RICH_TEXT,
    description: 'HTML formatted content with WYSIWYG editor',
    useCase: 'Body content, articles, formatted paragraphs, content with links/lists',
    frontendComponent: 'RichText',
    examples: ['Article Body', 'Product Description', 'Feature Description', 'Bio Text'],
  },
  {
    type: SITECORE_FIELD_TYPES.IMAGE,
    description: 'Image media reference with alt text and dimensions',
    useCase: 'Photos, graphics, icons, backgrounds, logos',
    frontendComponent: 'Image',
    examples: ['Hero Image', 'Product Image', 'Author Avatar', 'Card Thumbnail', 'Logo'],
  },
  {
    type: SITECORE_FIELD_TYPES.GENERAL_LINK,
    description: 'Flexible link supporting internal, external, media, and anchor links',
    useCase: 'CTAs, navigation links, any clickable element',
    frontendComponent: 'Link',
    examples: ['CTA Button', 'Read More Link', 'Social Media Link', 'Download Link'],
  },
  {
    type: SITECORE_FIELD_TYPES.INTERNAL_LINK,
    description: 'Link to internal Sitecore items only',
    useCase: 'Internal page references, related content',
    frontendComponent: 'Link',
    examples: ['Related Article Link', 'Category Page Link'],
  },
  {
    type: SITECORE_FIELD_TYPES.NUMBER,
    description: 'Decimal number value',
    useCase: 'Prices, ratings, percentages, measurements',
    frontendComponent: 'Text (formatted)',
    examples: ['Price', 'Rating Score', 'Discount Percentage'],
  },
  {
    type: SITECORE_FIELD_TYPES.INTEGER,
    description: 'Whole number value',
    useCase: 'Counts, quantities, order/sort values',
    frontendComponent: 'Text (formatted)',
    examples: ['Sort Order', 'Quantity', 'Year', 'Display Count'],
  },
  {
    type: SITECORE_FIELD_TYPES.CHECKBOX,
    description: 'Boolean true/false toggle',
    useCase: 'Feature flags, visibility toggles, options',
    frontendComponent: 'Conditional rendering',
    examples: ['Show Badge', 'Is Featured', 'Hide on Mobile', 'Enable Animation'],
  },
  {
    type: SITECORE_FIELD_TYPES.DATE,
    description: 'Date without time component',
    useCase: 'Publication dates, event dates, deadlines',
    frontendComponent: 'Date formatter',
    examples: ['Published Date', 'Event Date', 'Expiry Date'],
  },
  {
    type: SITECORE_FIELD_TYPES.DATETIME,
    description: 'Date with time component',
    useCase: 'Event start/end times, timestamps',
    frontendComponent: 'DateTime formatter',
    examples: ['Event Start Time', 'Last Updated', 'Scheduled Publish'],
  },
  {
    type: SITECORE_FIELD_TYPES.FILE,
    description: 'File media reference for downloads',
    useCase: 'PDF downloads, document attachments',
    frontendComponent: 'File download link',
    examples: ['PDF Brochure', 'Spec Sheet', 'Resume Download'],
  },
  {
    type: SITECORE_FIELD_TYPES.DROPLIST,
    description: 'Single selection from predefined text values',
    useCase: 'Static option selection, variants, themes',
    frontendComponent: 'Conditional styling/rendering',
    examples: ['Theme Color', 'Layout Variant', 'Size Option'],
  },
  {
    type: SITECORE_FIELD_TYPES.DROPLINK,
    description: 'Single item selection from Sitecore tree',
    useCase: 'Category selection, author reference, single related item',
    frontendComponent: 'Referenced item data',
    examples: ['Category', 'Author', 'Parent Location', 'Featured Product'],
  },
  {
    type: SITECORE_FIELD_TYPES.DROPTREE,
    description: 'Single item selection with tree browser',
    useCase: 'Deep hierarchy selection, specific content item',
    frontendComponent: 'Referenced item data',
    examples: ['Content Page Reference', 'Navigation Root'],
  },
  {
    type: SITECORE_FIELD_TYPES.MULTILIST,
    description: 'Multiple item selection from list',
    useCase: 'Tags, categories, multiple related items',
    frontendComponent: 'List of referenced items',
    examples: ['Tags', 'Categories', 'Related Products', 'Featured Articles'],
  },
  {
    type: SITECORE_FIELD_TYPES.MULTILIST_WITH_SEARCH,
    description: 'Multiple item selection with search capability',
    useCase: 'Large item pools, searchable selections',
    frontendComponent: 'List of referenced items',
    examples: ['Product Selection', 'Author Selection', 'Location Selection'],
  },
  {
    type: SITECORE_FIELD_TYPES.TREELIST,
    description: 'Multiple item selection with tree browser',
    useCase: 'Hierarchical multi-selection',
    frontendComponent: 'List of referenced items',
    examples: ['Child Pages', 'Nested Categories'],
  },
  {
    type: SITECORE_FIELD_TYPES.CHECKLIST,
    description: 'Multiple selection via checkboxes',
    useCase: 'Feature flags, multiple options selection',
    frontendComponent: 'List of selected options',
    examples: ['Features List', 'Amenities', 'Included Services'],
  },
  {
    type: SITECORE_FIELD_TYPES.NAME_VALUE_LIST,
    description: 'Key-value pairs for structured data',
    useCase: 'Custom attributes, metadata, specifications',
    frontendComponent: 'Key-value display',
    examples: ['Product Specifications', 'Technical Details', 'Custom Attributes'],
  },
];

/**
 * Design analysis result for a single field recommendation
 */
export interface AnalyzedField {
  name: string;
  displayName: string;
  type: SitecoreFieldType;
  description: string;
  required: boolean;
  section: string;
  source?: string;
  defaultValue?: string;
  reasoning: string;
}

/**
 * Complete design analysis result
 */
export interface DesignAnalysisResult {
  componentName: string;
  description: string;
  sections: Array<{
    name: string;
    description: string;
    fields: AnalyzedField[];
  }>;
  totalFields: number;
  recommendations: string[];
  templateStructure: {
    suggestedName: string;
    suggestedPath: string;
    baseTemplates: string[];
  };
}

// ============================================
// SITECORE BEST PRACTICES TYPES
// ============================================

/**
 * Result of best practice validation
 */
export interface BestPracticeValidationResult {
  /** Whether the validation passed without critical errors */
  isValid: boolean;
  /** Critical errors that should block the operation */
  errors: string[];
  /** Non-blocking warnings about potential issues */
  warnings: string[];
  /** Helpful suggestions for better practices */
  suggestions: string[];
  /** Recommended icon path for the item */
  recommendedIcon?: string;
}

/**
 * Context for item creation validation
 */
export interface ItemCreationContext {
  /** The name of the item to create */
  name: string;
  /** The template ID to use */
  templateId?: string;
  /** The template name (for icon recommendations) */
  templateName?: string;
  /** The parent path where item will be created */
  parentPath?: string;
  /** The parent ID where item will be created */
  parentId?: string;
  /** Fields to be set on the item */
  fields?: Array<{ name: string; value: string }>;
}

/**
 * Sitecore content tree paths configuration
 */
export interface ContentPathConfig {
  /** Main content root path */
  CONTENT: string;
  /** Media library root path */
  MEDIA_LIBRARY: string;
  /** Templates root path */
  TEMPLATES: string;
  /** Minimum depth for content items */
  MIN_CONTENT_DEPTH: number;
  /** System paths that should not contain content items */
  SYSTEM_PATHS: readonly string[];
  /** Protected paths requiring special handling */
  PROTECTED_PATHS: readonly string[];
}

/**
 * Naming convention rules for Sitecore items
 */
export interface NamingConventionConfig {
  /** Regex for invalid characters */
  INVALID_CHARACTERS: RegExp;
  /** Maximum allowed name length */
  MAX_NAME_LENGTH: number;
  /** Minimum required name length */
  MIN_NAME_LENGTH: number;
  /** Reserved names that cannot be used */
  RESERVED_NAMES: readonly string[];
  /** Naming patterns for different item types */
  PATTERNS: {
    TEMPLATE: RegExp;
    CONTENT_ITEM: RegExp;
    FOLDER: RegExp;
  };
}

/**
 * Standard Sitecore icon paths
 */
export interface SitecoreIconPaths {
  // Folder icons
  FOLDER: string;
  FOLDER_OPEN: string;
  FOLDER_BLUE: string;
  FOLDER_GREEN: string;
  FOLDER_YELLOW: string;
  
  // Content icons
  CONTENT_PAGE: string;
  ARTICLE: string;
  BLOG_POST: string;
  NEWS: string;
  
  // Media icons
  IMAGE: string;
  VIDEO: string;
  DOCUMENT: string;
  PDF: string;
  
  // Component icons
  COMPONENT: string;
  WIDGET: string;
  MODULE: string;
  
  // Data icons
  DATA_SOURCE: string;
  DATA_FOLDER: string;
  DICTIONARY: string;
  
  // Navigation icons
  NAVIGATION: string;
  MENU: string;
  LINK: string;
  
  // Settings icons
  SETTINGS: string;
  CONFIGURATION: string;
  
  // User/People icons
  USER: string;
  PEOPLE: string;
  AUTHOR: string;
  
  // Location icons
  LOCATION: string;
  STORE: string;
  REGION: string;
  
  // Product icons
  PRODUCT: string;
  CATEGORY: string;
  
  // Event icons
  EVENT: string;
  SCHEDULE: string;
  
  // Form icons
  FORM: string;
  INPUT: string;
  
  // Default
  DEFAULT: string;
}

