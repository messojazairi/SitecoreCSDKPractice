/**
 * GraphQL-specific type definitions for Sitecore API
 */

/**
 * GraphQL Response wrapper
 */
export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: GraphQLError[];
}

/**
 * GraphQL Error structure
 */
export interface GraphQLError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: string[];
  extensions?: Record<string, any>;
}

/**
 * GraphQL Connection pattern (edges/nodes)
 */
export interface GraphQLConnection<T> {
  edges: Array<{
    node: T;
    cursor?: string;
  }>;
  pageInfo?: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
  totalCount?: number;
}

/**
 * GraphQL Template from API
 */
export interface GraphQLTemplate {
  templateId: string;
  name: string;
  fullName?: string;
  icon?: string;
  ownFields?: GraphQLConnection<GraphQLTemplateField>;
  sections?: GraphQLConnection<GraphQLTemplateSection>;
  baseTemplates?: GraphQLConnection<GraphQLBaseTemplate>;
}

/**
 * GraphQL Template Field
 */
export interface GraphQLTemplateField {
  fieldId?: string;
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

/**
 * GraphQL Template Section
 */
export interface GraphQLTemplateSection {
  sectionId?: string;
  name: string;
  icon?: string;
  sortOrder?: number;
}

/**
 * GraphQL Base Template
 */
export interface GraphQLBaseTemplate {
  templateId: string;
  name: string;
}

/**
 * GraphQL Item from API
 */
export interface GraphQLItem {
  itemId: string;
  name: string;
  path: string;
  template?: {
    name: string;
    templateId?: string;
  };
  fields?: Array<{
    name: string;
    value: string;
  }>;
  hasChildren?: boolean;
  children?: GraphQLConnection<GraphQLItem>;
  created?: string;
  updated?: string;
}

/**
 * GraphQL Variables for Template Operations
 */
export interface CreateTemplateVariables {
  input: {
    name: string;
    parent: string;
    language: string;
    icon?: string;
    sections?: Array<{
      name: string;
      icon?: string;
      sortOrder?: number;
      fields?: Array<{
        name: string;
        type: string;
        defaultValue?: string;
        description?: string;
        tooltip?: string;
        source?: string;
        validation?: string;
        shared?: boolean;
        unversioned?: boolean;
      }>;
    }>;
    baseTemplates?: string[];
    createStandardValuesItem?: boolean;
  };
}

export interface UpdateTemplateVariables {
  input: {
    template: string;
    name?: string;
    icon?: string;
    sections?: Array<{
      name: string;
      fields?: Array<{
        name: string;
        type: string;
      }>;
    }>;
  };
}

export interface DeleteTemplateVariables {
  input: {
    template: string;
  };
}

/**
 * GraphQL Variables for Item Operations
 */
export interface CreateItemVariables {
  input: {
    name: string;
    parent: string;
    template: string;
    language: string;
    fields?: Array<{
      name: string;
      value: string;
    }>;
  };
}

export interface UpdateItemVariables {
  input: {
    item: string;
    name?: string;
    language?: string;
    fields?: Array<{
      name: string;
      value: string;
    }>;
  };
}

export interface DeleteItemVariables {
  input: {
    item: string;
  };
}

export interface MoveItemVariables {
  input: {
    item: string;
    targetParent: string;
  };
}

/**
 * GraphQL Variables for Publishing
 */
export interface PublishItemVariables {
  input: {
    item: string;
    language?: string;
    targets?: string[];
    deep?: boolean;
  };
}

/**
 * GraphQL Variables for Search
 */
export interface SearchItemsVariables {
  where?: {
    template?: {
      id?: string;
      name?: string;
    };
    name?: {
      contains?: string;
      equals?: string;
    };
    path?: {
      startsWith?: string;
      equals?: string;
    };
  };
  first: number;
  language: string;
  after?: string;
}

/**
 * GraphQL Query Response Types
 */
export interface ListTemplatesResponse {
  itemTemplates: GraphQLConnection<GraphQLTemplate>;
}

export interface GetTemplateResponse {
  itemTemplate: GraphQLTemplate;
}

export interface CreateTemplateResponse {
  createItemTemplate: {
    itemTemplate: GraphQLTemplate;
  };
}

export interface UpdateTemplateResponse {
  updateItemTemplate: {
    itemTemplate: GraphQLTemplate;
  };
}

export interface DeleteTemplateResponse {
  deleteItemTemplate: {
    success: boolean;
  };
}

export interface GetItemResponse {
  item: GraphQLItem;
}

export interface ListItemsResponse {
  item: {
    children: GraphQLConnection<GraphQLItem>;
  };
}

export interface SearchItemsResponse {
  items: GraphQLConnection<GraphQLItem>;
}

export interface CreateItemResponse {
  createItem: {
    item: GraphQLItem;
  };
}

export interface UpdateItemResponse {
  updateItem: {
    item: GraphQLItem;
  };
}

export interface DeleteItemResponse {
  deleteItem: {
    successful: boolean;
  };
}

export interface MoveItemResponse {
  moveItem: {
    item: GraphQLItem;
  };
}

export interface PublishItemResponse {
  publishItem: {
    success: boolean;
  };
}

