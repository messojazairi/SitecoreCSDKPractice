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

