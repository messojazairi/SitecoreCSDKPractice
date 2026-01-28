/**
 * Reusable GraphQL Queries and Mutations for Sitecore API
 */

/**
 * Template Queries
 */
export const TEMPLATE_QUERIES = {
  LIST_TEMPLATES: `
    query ListTemplates($first: Int) {
      itemTemplates(first: $first) {
        edges {
          node {
            templateId
            name
            fullName
            icon
            ownFields {
              edges {
                node {
                  name
                  type
                }
              }
            }
          }
        }
      }
    }
  `,

  GET_TEMPLATE: `
    query GetTemplate($id: ID!, $language: String!) {
      itemTemplate(id: $id, language: $language) {
        templateId
        name
        fullName
        icon
        ownFields {
          edges {
            node {
              name
              type
              defaultValue
              description
            }
          }
        }
        sections {
          edges {
            node {
              name
              sortOrder
              icon
            }
          }
        }
        baseTemplates {
          edges {
            node {
              templateId
              name
            }
          }
        }
      }
    }
  `,

  GET_TEMPLATE_BY_NAME: `
    query GetTemplateByName($name: String!) {
      itemTemplates(where: { name: $name }, first: 1) {
        edges {
          node {
            templateId
            name
            fullName
            icon
            ownFields {
              edges {
                node {
                  name
                  type
                }
              }
            }
          }
        }
      }
    }
  `,
};

/**
 * Template Mutations
 */
export const TEMPLATE_MUTATIONS = {
  CREATE_TEMPLATE: `
    mutation CreateTemplate($input: CreateItemTemplateInput!) {
      createItemTemplate(input: $input) {
        itemTemplate {
          templateId
          name
          fullName
          icon
          ownFields {
            edges {
              node {
                name
                type
              }
            }
          }
          sections {
            edges {
              node {
                name
                sortOrder
              }
            }
          }
        }
      }
    }
  `,

  UPDATE_TEMPLATE: `
    mutation UpdateTemplate($input: UpdateItemTemplateInput!) {
      updateItemTemplate(input: $input) {
        itemTemplate {
          templateId
          name
          fullName
          icon
          ownFields {
            edges {
              node {
                name
                type
              }
            }
          }
        }
      }
    }
  `,

  DELETE_TEMPLATE: `
    mutation DeleteTemplate($input: DeleteItemTemplateInput!) {
      deleteItemTemplate(input: $input) {
        success
      }
    }
  `,
};

/**
 * Item Queries
 */
export const ITEM_QUERIES = {
  GET_ITEM: `
    query GetItem($id: ID!, $language: String!) {
      item(id: $id, language: $language) {
        itemId
        name
        path
        template {
          name
          templateId
        }
        fields {
          name
          value
        }
        hasChildren
      }
    }
  `,

  GET_ITEM_BY_PATH: `
    query GetItemByPath($path: String!, $language: String!) {
      item(path: $path, language: $language) {
        itemId
        name
        path
        template {
          name
          templateId
        }
        fields {
          name
          value
        }
        hasChildren
      }
    }
  `,

  LIST_CHILDREN: `
    query ListChildren($path: String!, $language: String!) {
      item(path: $path, language: $language) {
        children {
          edges {
            node {
              itemId
              name
              path
              template {
                name
              }
              hasChildren
            }
          }
        }
      }
    }
  `,

  SEARCH_ITEMS: `
    query SearchItems($first: Int!, $language: String!) {
      search(first: $first, language: $language) {
        results {
          itemId
          name
          path
          template {
            name
          }
        }
      }
    }
  `,
};

/**
 * Item Mutations
 */
export const ITEM_MUTATIONS = {
  CREATE_ITEM: `
    mutation CreateItem($input: CreateItemInput!) {
      createItem(input: $input) {
        item {
          itemId
          name
          path
          template {
            name
            templateId
          }
          fields {
            name
            value
          }
        }
      }
    }
  `,

  UPDATE_ITEM: `
    mutation UpdateItem($input: UpdateItemInput!) {
      updateItem(input: $input) {
        item {
          itemId
          name
          path
          template {
            name
          }
          fields {
            name
            value
          }
        }
      }
    }
  `,

  DELETE_ITEM: `
    mutation DeleteItem($input: DeleteItemInput!) {
      deleteItem(input: $input) {
        successful
      }
    }
  `,

  MOVE_ITEM: `
    mutation MoveItem($input: MoveItemInput!) {
      moveItem(input: $input) {
        item {
          itemId
          name
          path
          template {
            name
          }
        }
      }
    }
  `,

  RENAME_ITEM: `
    mutation RenameItem($input: RenameItemInput!) {
      renameItem(input: $input) {
        item {
          itemId
          name
          path
        }
      }
    }
  `,

  COPY_ITEM: `
    mutation CopyItem($input: CopyItemInput!) {
      copyItem(input: $input) {
        item {
          itemId
          name
          path
        }
      }
    }
  `,
};

/**
 * Publishing Mutations
 */
export const PUBLISHING_MUTATIONS = {
  PUBLISH_ITEM: `
    mutation PublishItem($input: PublishItemInput!) {
      publishItem(input: $input) {
        success
      }
    }
  `,

  UNPUBLISH_ITEM: `
    mutation UnpublishItem($input: UnpublishItemInput!) {
      unpublishItem(input: $input) {
        success
      }
    }
  `,
};

/**
 * System Queries
 */
export const SYSTEM_QUERIES = {
  GET_LANGUAGES: `
    query GetLanguages {
      languages {
        name
        code
      }
    }
  `,

  GET_DATABASES: `
    query GetDatabases {
      databases {
        name
      }
    }
  `,
};

/**
 * Field Type Definitions (common Sitecore field types)
 */
export const FIELD_TYPES = {
  // Text Fields
  SINGLE_LINE_TEXT: 'Single-Line Text',
  MULTI_LINE_TEXT: 'Multi-Line Text',
  RICH_TEXT: 'Rich Text',
  
  // Number Fields
  NUMBER: 'Number',
  INTEGER: 'Integer',
  
  // Date Fields
  DATE: 'Date',
  DATETIME: 'Datetime',
  
  // Link Fields
  GENERAL_LINK: 'General Link',
  DROPLINK: 'Droplink',
  DROPTREE: 'Droptree',
  
  // List Fields
  DROPLIST: 'Droplist',
  GROUPED_DROPLIST: 'Grouped Droplist',
  CHECKLIST: 'Checklist',
  MULTILIST: 'Multilist',
  TREELIST: 'Treelist',
  
  // Media Fields
  IMAGE: 'Image',
  FILE: 'File',
  
  // Boolean Fields
  CHECKBOX: 'Checkbox',
  
  // Lookup Fields
  ITEM_LINK: 'Item Link',
  ITEM_REFERENCE: 'Item Reference',
  
  // Special Fields
  NAME_VALUE_LIST: 'Name Value List',
  QUERY_DATASOURCE: 'Query Datasource',
} as const;

/**
 * Common parent paths in Sitecore
 */
export const COMMON_PATHS = {
  // Content
  CONTENT_ROOT: '/sitecore/content',
  
  // Templates
  TEMPLATE_ROOT: '/sitecore/templates',
  TEMPLATE_PROJECT: '/sitecore/templates/Project',
  TEMPLATE_FOUNDATION: '/sitecore/templates/Foundation',
  TEMPLATE_FEATURE: '/sitecore/templates/Feature',
  
  // Media
  MEDIA_ROOT: '/sitecore/media library',
  
  // System
  SYSTEM_ROOT: '/sitecore/system',
  
  // Layout
  LAYOUT_ROOT: '/sitecore/layout',
} as const;

/**
 * Helper to build search where clause
 */
export function buildSearchWhere(params: {
  templateId?: string;
  templateName?: string;
  nameContains?: string;
  path?: string;
}): string {
  const conditions: string[] = [];

  if (params.templateId) {
    conditions.push(`template: { id: "${params.templateId}" }`);
  }

  if (params.templateName) {
    conditions.push(`template: { name: "${params.templateName}" }`);
  }

  if (params.nameContains) {
    conditions.push(`name: { contains: "${params.nameContains}" }`);
  }

  if (params.path) {
    conditions.push(`path: { startsWith: "${params.path}" }`);
  }

  return conditions.length > 0 ? `{ ${conditions.join(', ')} }` : '';
}

