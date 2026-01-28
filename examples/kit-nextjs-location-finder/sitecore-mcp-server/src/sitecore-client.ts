/**
 * Sitecore XM Cloud API Client
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  SitecoreConfig,
  SitecoreTemplate,
  SitecoreItem,
  GraphQLResponse,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  CreateItemRequest,
  UpdateItemRequest,
  MoveItemRequest,
  PublishItemRequest,
  PublishTreeRequest,
  UploadMediaRequest,
} from './types/sitecore.js';
import { Cache, CacheManager } from './utils/cache.js';
import { createLogger, PerformanceTimer } from './utils/logger.js';
import { retry, CircuitBreaker, RateLimiter } from './utils/retry.js';
import {
  validateRequired,
  validateGuid,
  validatePath,
  sanitizeGuid,
} from './utils/validators.js';
import { ITEM_QUERIES } from './utils/graphql-queries.js';

const logger = createLogger('SitecoreClient');

/**
 * Static owner for all items created through the MCP server
 * This ensures consistent ownership and cannot be changed by users
 */
const SITECORE_MCP_OWNER = 'sitecore\\Sitecore-MCP';

export class SitecoreClient {
  private client: AxiosInstance;
  public config: SitecoreConfig;
  private accessToken: string | null = null;
  private graphqlEndpoint: string;
  private cacheManager: CacheManager;
  private templateCache: Cache<SitecoreTemplate>;
  private itemCache: Cache<SitecoreItem>;
  private circuitBreaker: CircuitBreaker;
  private rateLimiter: RateLimiter;

  constructor(config: SitecoreConfig) {
    this.config = config;
    this.graphqlEndpoint = `${config.instanceUrl}/sitecore/api/authoring/graphql/v1`;
    
    // Initialize cache manager
    this.cacheManager = new CacheManager();
    this.templateCache = this.cacheManager.getCache<SitecoreTemplate>('templates', {
      ttl: 300000, // 5 minutes
      maxSize: 500,
    });
    this.itemCache = this.cacheManager.getCache<SitecoreItem>('items', {
      ttl: 60000, // 1 minute
      maxSize: 1000,
    });

    // Initialize circuit breaker and rate limiter
    // Increased threshold for workflows (10 failures instead of 5)
    // Reduced timeout to 30s for faster recovery
    this.circuitBreaker = new CircuitBreaker(10, 30000); // 10 failures, 30s timeout
    this.rateLimiter = new RateLimiter(100, 10); // 100 tokens, refill 10/sec
    
    this.client = axios.create({
      baseURL: config.instanceUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    logger.info('Sitecore client initialized', {
      instanceUrl: config.instanceUrl,
      hasApiKey: !!config.apiKey,
      hasOAuth: !!(config.clientId && config.clientSecret),
      defaultOwner: SITECORE_MCP_OWNER,
    });

    // Set up request interceptor for authentication
    this.client.interceptors.request.use(async (config) => {
      if (this.config.apiKey) {
        config.headers.Authorization = `Bearer ${this.config.apiKey}`;
      } else if (this.config.clientId && this.config.clientSecret) {
        // Get OAuth token if not already available
        if (!this.accessToken) {
          await this.authenticate();
        }
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    // Set up response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401 && this.config.clientId) {
          // Token expired, try to refresh
          logger.warn('Access token expired, refreshing...');
          this.accessToken = null;
          await this.authenticate();
          // Retry the request
          if (error.config) {
            return this.client.request(error.config);
          }
        }
        return Promise.reject(error);
      }
    );

    // Start cache cleanup interval
    setInterval(() => {
      const cleaned = this.cacheManager.cleanupAll();
      if (cleaned > 0) {
        logger.debug(`Cleaned ${cleaned} expired cache entries`);
      }
    }, 60000); // Clean every minute
  }

  /**
   * Authenticate using OAuth 2.0
   */
  private async authenticate(): Promise<void> {
    if (!this.config.oauthTokenUrl || !this.config.clientId || !this.config.clientSecret) {
      throw new Error('OAuth credentials not configured');
    }

    const timer = new PerformanceTimer('SitecoreClient', 'OAuth Authentication');

    try {
      logger.info('Authenticating with OAuth 2.0...');

      const response = await retry(
        async () => {
          return await axios.post(
            this.config.oauthTokenUrl!,
            {
              grant_type: 'client_credentials',
              client_id: this.config.clientId,
              client_secret: this.config.clientSecret,
              audience: this.config.oauthAudience || 'https://api.sitecorecloud.io',
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
        },
        {
          maxAttempts: 3,
          initialDelay: 1000,
          onRetry: (attempt, error) => {
            logger.warn(`Auth retry attempt ${attempt}: ${error.message}`);
          },
        }
      );

      this.accessToken = response.data.access_token;
      logger.info('Authentication successful');
      timer.end();
    } catch (error) {
      timer.endWithError(error as Error);
      throw new Error(`Failed to authenticate with Sitecore: ${(error as Error).message}`);
    }
  }

  /**
   * Execute GraphQL query or mutation (public method)
   */
  async executeGraphQL<T = any>(
    query: string,
    variables?: any,
    options: { useCache?: boolean; cacheKey?: string } = {}
  ): Promise<T> {
    const timer = new PerformanceTimer('SitecoreClient', 'GraphQL Execution');

    // Check cache for read operations (queries)
    if (options.useCache && options.cacheKey) {
      const cached = this.itemCache.get(options.cacheKey) || this.templateCache.get(options.cacheKey);
      if (cached) {
        logger.debug('Cache hit', { cacheKey: options.cacheKey });
        return cached as unknown as T;
      }
      logger.debug('Cache miss', { cacheKey: options.cacheKey });
    }

    try {
      // Rate limit check
      await this.rateLimiter.acquire(1);

      // Execute with circuit breaker and retry
      const result = await this.circuitBreaker.execute(async () => {
        return await retry(
          async () => {
            logger.debug('Executing GraphQL', {
              query: query.substring(0, 100) + '...',
              variables,
            });

            const response = await this.client.post<GraphQLResponse<T>>(
              this.graphqlEndpoint,
              {
                query,
                variables,
              }
            );

            if (response.data.errors && response.data.errors.length > 0) {
              const errorMessages = response.data.errors.map(e => e.message).join(', ');
              logger.error('GraphQL returned errors', new Error(errorMessages), {
                errors: response.data.errors,
              });
              throw new Error(`GraphQL Error: ${errorMessages}`);
            }

            if (!response.data.data) {
              throw new Error('No data returned from GraphQL query');
            }

            return response.data.data;
          },
          {
            maxAttempts: 3,
            initialDelay: 1000,
            onRetry: (attempt, error) => {
              logger.warn(`GraphQL retry attempt ${attempt}`, { error: error.message });
            },
          }
        );
      });

      timer.end();
      return result;
    } catch (error) {
      timer.endWithError(error as Error);

      if (axios.isAxiosError(error) && error.response?.data) {
        const graphqlError = error.response.data as GraphQLResponse;
        if (graphqlError.errors) {
          const errorMessages = graphqlError.errors.map(e => e.message).join(', ');
          throw new Error(`GraphQL Error: ${errorMessages}`);
        }
      }
      throw this.handleError(error, 'GraphQL execution failed');
    }
  }

  /**
   * Get all templates
   */
  async getTemplates(): Promise<SitecoreTemplate[]> {
    const query = `
      query GetTemplates {
        itemTemplates(first: 100) {
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
    `;

    try {
      const result = await this.executeGraphQL<any>(query);
      const edges = result.itemTemplates?.edges || [];
      return edges.map((edge: any) => this.mapGraphQLTemplateToModel(edge.node));
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch templates');
    }
  }

  /**
   * Find a template by name (searches all templates)
   */
  async findTemplateByName(name: string): Promise<SitecoreTemplate | null> {
    validateRequired(name, 'template name');
    
    try {
      logger.info('Searching for template by name', { name });
      
      // Get all templates and filter by name
      const templates = await this.getTemplates();
      const matchingTemplate = templates.find(
        (t) => t.name.toLowerCase() === name.toLowerCase() || 
               t.name.toLowerCase().includes(name.toLowerCase())
      );
      
      if (matchingTemplate) {
        logger.debug('Template found by name', { name, id: matchingTemplate.templateId });
        return matchingTemplate;
      }
      
      logger.debug('Template not found by name', { name });
      return null;
    } catch (error) {
      throw this.handleError(error, `Failed to find template by name: ${name}`);
    }
  }

  /**
   * Get a specific template by ID or name
   */
  async getTemplate(idOrName: string, useCache: boolean = true): Promise<SitecoreTemplate> {
    validateRequired(idOrName, 'template ID or name');
    
    // Check if it's a GUID (with or without dashes/braces)
    const guidPattern = /^[{]?[0-9a-fA-F]{8}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{12}[}]?$/;
    const isGuid = guidPattern.test(idOrName.replace(/-/g, ''));
    
    let cleanId: string;
    
    if (isGuid) {
      // It's a GUID, validate and sanitize
      validateGuid(idOrName, 'template ID');
      cleanId = sanitizeGuid(idOrName);
      
      // Format GUID with dashes if missing (32 chars without dashes)
      if (!cleanId.includes('-') && cleanId.length === 32) {
        cleanId = `${cleanId.substring(0, 8)}-${cleanId.substring(8, 12)}-${cleanId.substring(12, 16)}-${cleanId.substring(16, 20)}-${cleanId.substring(20)}`;
      }
    } else {
      // It's a name, find the template first
      logger.info('Template identifier is a name, searching...', { name: idOrName });
      const template = await this.findTemplateByName(idOrName);
      if (!template) {
        throw new Error(`Template not found: ${idOrName}`);
      }
      cleanId = sanitizeGuid(template.templateId || template.id);
      
      // Format GUID with dashes if missing (32 chars without dashes)
      if (!cleanId.includes('-') && cleanId.length === 32) {
        cleanId = `${cleanId.substring(0, 8)}-${cleanId.substring(8, 12)}-${cleanId.substring(12, 16)}-${cleanId.substring(16, 20)}-${cleanId.substring(20)}`;
      }
    }

    // Check cache
    const cacheKey = `template:${cleanId}`;
    if (useCache) {
      const cached = this.templateCache.get(cacheKey);
      if (cached) {
        logger.debug('Template cache hit', { id: cleanId });
        return cached;
      }
    }

    const query = `
      query GetTemplate($templateId: ID!) {
        itemTemplates(where: { templateId: $templateId }, first: 1) {
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
        }
      }
    `;

    try {
      logger.info('Fetching template', { id: cleanId });
      const result = await this.executeGraphQL<any>(query, { templateId: cleanId });
      
      const edges = result.itemTemplates?.edges || [];
      if (edges.length === 0) {
        throw new Error(`Template not found: ${cleanId}`);
      }
      
      const graphqlTemplate = edges[0].node;
      
      const template = this.mapGraphQLTemplateToModel(graphqlTemplate);

      // Cache the result
      this.templateCache.set(cacheKey, template);
      logger.debug('Template cached', { id: cleanId });

      return template;
    } catch (error) {
      throw this.handleError(error, `Failed to fetch template ${cleanId}`);
    }
  }

  /**
   * Create a new template
   */
  async createTemplate(request: CreateTemplateRequest): Promise<SitecoreTemplate> {
    // Validate input
    validateRequired(request.name, 'template name');
    
    try {
      logger.info('Creating template', { name: request.name });

      // Resolve parent if parentPath is provided
      let parentId = request.parent;
      if (request.parentPath && !parentId) {
        logger.debug('Resolving parent path', { path: request.parentPath });
        const parentItem = await this.getItemByPath(request.parentPath);
        parentId = sanitizeGuid(parentItem.itemId || parentItem.id);
        
        // Format GUID with dashes if missing (32 chars without dashes)
        if (!parentId.includes('-') && parentId.length === 32) {
          parentId = `${parentId.substring(0, 8)}-${parentId.substring(8, 12)}-${parentId.substring(12, 16)}-${parentId.substring(16, 20)}-${parentId.substring(20)}`;
        }
      } else if (parentId) {
        // Format GUID with dashes if missing
        const cleanId = sanitizeGuid(parentId);
        if (!cleanId.includes('-') && cleanId.length === 32) {
          parentId = `${cleanId.substring(0, 8)}-${cleanId.substring(8, 12)}-${cleanId.substring(12, 16)}-${cleanId.substring(16, 20)}-${cleanId.substring(20)}`;
        } else {
          parentId = cleanId;
        }
      }

      if (!parentId) {
        throw new Error('Parent ID or parent path is required');
      }

      // Template Template ID in Sitecore
      const templateTemplateId = 'AB86861A-6030-46C5-B394-E8F99E8B87DB';
      
      // Create template as an item so we can set owner field
      const fields: Array<{ name: string; value: string }> = [];

      if (request.icon) {
        fields.push({
          name: '__Icon',
          value: request.icon,
        });
      }

      // Create the template item (without owner - it's a protected field)
      const templateItem = await this.createItem({
        name: request.name,
        templateId: templateTemplateId,
        parent: parentId,
        language: request.language || 'en',
        fields: fields,
      });

      // CRITICAL: Update the owner AFTER creation (owner is a protected field)
      try {
        const itemId = templateItem.itemId || templateItem.id;
        logger.info('Setting template owner', { 
          id: itemId, 
          owner: SITECORE_MCP_OWNER 
        });
        
        // Try multiple approaches to set the owner
        await this.setItemOwner(itemId, SITECORE_MCP_OWNER, request.language || 'en');
        
        logger.info('Template owner updated successfully', { 
          id: itemId,
          owner: SITECORE_MCP_OWNER
        });
      } catch (ownerError) {
        logger.error('Failed to update template owner', ownerError as Error, {
          id: templateItem.itemId,
          owner: SITECORE_MCP_OWNER,
          errorDetails: (ownerError as Error).message
        });
        // Continue anyway - don't fail template creation
      }

      // If sections are provided, create them
      if (request.sections && request.sections.length > 0) {
        const templateSectionTemplateId = '269150A9-F9E3-4FC0-8B3A-EE0E03F0DD1B'; // Template Section
        const templateFieldTemplateId = '455A3E98-A627-4B40-8035-E683A0331AC7'; // Template Field
        
        for (const section of request.sections) {
          const sectionItem = await this.createItem({
            name: section.name,
            templateId: templateSectionTemplateId,
            parent: templateItem.itemId || templateItem.id,
            language: request.language || 'en',
            fields: [
              ...(section.icon ? [{ name: '__Icon', value: section.icon }] : []),
              ...(section.sortOrder !== undefined ? [{ name: '__Sortorder', value: section.sortOrder.toString() }] : []),
            ],
          });

          // Update owner after creation
          try {
            const sectionId = sectionItem.itemId || sectionItem.id;
            logger.debug('Setting section owner', { 
              sectionId: sectionId,
              owner: SITECORE_MCP_OWNER
            });
            await this.setItemOwner(sectionId, SITECORE_MCP_OWNER, request.language || 'en');
            logger.debug('Section owner updated successfully', { 
              sectionId: sectionId,
              owner: SITECORE_MCP_OWNER
            });
          } catch (error) {
            logger.warn('Failed to set section owner', { 
              error: (error as Error).message,
              sectionId: sectionItem.itemId,
              owner: SITECORE_MCP_OWNER,
              errorDetails: (error as Error).message
            });
          }

          // Create fields within the section
          if (section.fields && section.fields.length > 0) {
            for (const field of section.fields) {
              const fieldItem = await this.createItem({
                name: field.name,
                templateId: templateFieldTemplateId,
                parent: sectionItem.itemId || sectionItem.id,
                language: request.language || 'en',
                fields: [
                  { name: 'Type', value: field.type },
                  ...(field.source ? [{ name: 'Source', value: field.source }] : []),
                  ...(field.defaultValue ? [{ name: 'Default Value', value: field.defaultValue }] : []),
                  ...(field.shared ? [{ name: 'Shared', value: '1' }] : []),
                  ...(field.unversioned ? [{ name: 'Unversioned', value: '1' }] : []),
                ],
              });

              // Update owner after creation
              try {
                const fieldId = fieldItem.itemId || fieldItem.id;
                logger.debug('Setting field owner', { 
                  fieldId: fieldId,
                  owner: SITECORE_MCP_OWNER
                });
                await this.setItemOwner(fieldId, SITECORE_MCP_OWNER, request.language || 'en');
                logger.debug('Field owner updated successfully', { 
                  fieldId: fieldId,
                  owner: SITECORE_MCP_OWNER
                });
              } catch (error) {
                logger.warn('Failed to set field owner', { 
                  error: (error as Error).message,
                  fieldId: fieldItem.itemId,
                  owner: SITECORE_MCP_OWNER,
                  errorDetails: (error as Error).message
                });
              }
            }
          }
        }
      }

      // Fetch the created template to return proper structure
      const createdTemplate = await this.getItem(templateItem.itemId || templateItem.id, request.language || 'en');

      // Invalidate template list cache
      this.templateCache.clear();
      logger.info('Template created successfully', {
        id: createdTemplate.itemId,
        name: createdTemplate.name,
        owner: SITECORE_MCP_OWNER,
      });

      // Map to template structure
      return {
        id: createdTemplate.itemId || createdTemplate.id,
        templateId: createdTemplate.itemId || createdTemplate.id,
        name: createdTemplate.name,
        fullName: createdTemplate.path,
        icon: request.icon,
        fields: [],
        sections: [],
        baseTemplates: [],
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to create template');
    }
  }

  /**
   * Update an existing template
   */
  async updateTemplate(id: string, request: UpdateTemplateRequest): Promise<SitecoreTemplate> {
    const mutation = `
      mutation UpdateTemplate($input: UpdateItemTemplateInput!) {
        updateItemTemplate(input: $input) {
          itemTemplate {
            templateId
            name
            fullName
            icon
          }
        }
      }
    `;

    try {
      const variables = {
        input: {
          template: id.replace(/[{}]/g, ''),
          name: request.name,
          icon: request.icon,
          sections: request.sections,
        },
      };

      const result = await this.executeGraphQL<any>(mutation, variables);
      return this.mapGraphQLTemplateToModel(result.updateItemTemplate.itemTemplate);
    } catch (error) {
      throw this.handleError(error, `Failed to update template ${id}`);
    }
  }

  /**
   * Delete a template
   */
  async deleteTemplate(id: string): Promise<void> {
    const mutation = `
      mutation DeleteTemplate($input: DeleteItemTemplateInput!) {
        deleteItemTemplate(input: $input) {
          success
        }
      }
    `;

    try {
      await this.executeGraphQL(mutation, {
        input: { template: id.replace(/[{}]/g, '') },
      });
    } catch (error) {
      throw this.handleError(error, `Failed to delete template ${id}`);
    }
  }

  /**
   * Get an item by ID
   */
  async getItem(id: string, language: string = 'en', useCache: boolean = true): Promise<SitecoreItem> {
    // Validate and sanitize input
    validateRequired(id, 'item ID');
    
    // Try to validate as GUID, but be lenient
    let cleanId: string;
    try {
      validateGuid(id, 'item ID');
      cleanId = sanitizeGuid(id);
    } catch (error) {
      // If validation fails, try sanitizing anyway (might be a valid GUID without dashes)
      cleanId = sanitizeGuid(id);
      // If it's not 32 hex chars after sanitizing, it's probably not a GUID
      const cleaned = cleanId.replace(/-/g, '');
      if (!/^[0-9a-fA-F]{32}$/i.test(cleaned)) {
        throw error; // Re-throw original validation error
      }
    }

    // Check cache
    const cacheKey = `item:${cleanId}:${language}`;
    if (useCache) {
      const cached = this.itemCache.get(cacheKey);
      if (cached) {
        logger.debug('Item cache hit', { id: cleanId, language });
        return cached;
      }
    }

    const query = `
      query GetItem($itemId: ID!) {
        item(where: { itemId: $itemId, language: "${language}" }) {
          itemId
          name
          displayName
          path
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
          hasChildren
          parent {
            itemId
            name
            path
          }
          children {
            edges {
              node {
                itemId
                name
                path
                template {
                  name
                }
              }
            }
          }
        }
      }
    `;

    try {
      logger.info('Fetching item', { id: cleanId, language });
      const result = await this.executeGraphQL<any>(query, { itemId: cleanId });
      const item = this.mapGraphQLItemToModel(result.item);

      // Cache the result
      this.itemCache.set(cacheKey, item);
      logger.debug('Item cached', { id: cleanId, language });

      return item;
    } catch (error) {
      throw this.handleError(error, `Failed to fetch item ${cleanId}`);
    }
  }

  /**
   * Get item by path
   */
  async getItemByPath(path: string, language: string = 'en'): Promise<SitecoreItem> {
    const query = `
      query GetItemByPath($path: String!) {
        item(where: { path: $path, language: "${language}" }) {
          itemId
          name
          displayName
          path
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
          hasChildren
          parent {
            itemId
            name
            path
          }
          children {
            edges {
              node {
                itemId
                name
                path
                template {
                  name
                }
              }
            }
          }
        }
      }
    `;

    try {
      const result = await this.executeGraphQL<any>(query, { path });
      return this.mapGraphQLItemToModel(result.item);
    } catch (error) {
      throw this.handleError(error, `Failed to fetch item at path ${path}`);
    }
  }

  /**
   * List items (children of a path)
   */
  async listItems(path: string, language: string = 'en', includeChildren: boolean = true): Promise<SitecoreItem[]> {
    const query = `
      query ListItems($path: String!) {
        item(where: { path: $path, language: "${language}" }) {
          children {
            edges {
              node {
                itemId
                name
                path
                template {
                  templateId
                  name
                }
                hasChildren
              }
            }
          }
        }
      }
    `;

    try {
      const result = await this.executeGraphQL<any>(query, { path });
      const edges = result.item?.children?.edges || [];
      return edges.map((edge: any) => this.mapGraphQLItemToModel(edge.node));
    } catch (error) {
      throw this.handleError(error, `Failed to list items at ${path}`);
    }
  }

  /**
   * Create a new item
   */
  async createItem(request: CreateItemRequest): Promise<SitecoreItem> {
    // Validate input
    validateRequired(request.name, 'item name');
    validateRequired(request.templateId, 'template ID');
    validateGuid(request.templateId, 'template ID');

    const mutation = `
      mutation CreateItem($input: CreateItemInput!) {
        createItem(input: $input) {
          item {
            itemId
            name
            displayName
            path
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
            hasChildren
            parent {
              itemId
              name
              path
            }
          }
        }
      }
    `;

    try {
      logger.info('Creating item', {
        name: request.name,
        templateId: request.templateId,
        parent: request.parent,
        parentPath: request.parentPath,
      });

      // Resolve parent if parentPath is provided
      let parentId = request.parent;
      if (request.parentPath && !parentId) {
        logger.debug('Resolving parent path', { path: request.parentPath });
        try {
          const parentItem = await this.getItemByPath(request.parentPath);
          parentId = sanitizeGuid(parentItem.itemId || parentItem.id);
          
          // Format GUID with dashes if missing (32 chars without dashes)
          if (!parentId.includes('-') && parentId.length === 32) {
            parentId = `${parentId.substring(0, 8)}-${parentId.substring(8, 12)}-${parentId.substring(12, 16)}-${parentId.substring(16, 20)}-${parentId.substring(20)}`;
          }
          
          logger.debug('Parent resolved', { path: request.parentPath, id: parentId });
        } catch (error) {
          logger.error('Failed to resolve parent path', error as Error, { path: request.parentPath });
          throw new Error(`Cannot find parent path: ${request.parentPath}. ${(error as Error).message}`);
        }
      } else if (parentId) {
        // Format GUID with dashes if missing
        const cleanId = sanitizeGuid(parentId);
        if (!cleanId.includes('-') && cleanId.length === 32) {
          parentId = `${cleanId.substring(0, 8)}-${cleanId.substring(8, 12)}-${cleanId.substring(12, 16)}-${cleanId.substring(16, 20)}-${cleanId.substring(20)}`;
        } else {
          parentId = cleanId;
        }
      }

      if (!parentId) {
        throw new Error('Parent ID or parent path is required to create an item');
      }

      // Clean and format IDs - parentId is already formatted above if needed
      const cleanParentId = sanitizeGuid(parentId);
      // Format parent ID with dashes if missing (after sanitization)
      let formattedParentId = cleanParentId;
      if (!formattedParentId.includes('-') && formattedParentId.length === 32) {
        formattedParentId = `${formattedParentId.substring(0, 8)}-${formattedParentId.substring(8, 12)}-${formattedParentId.substring(12, 16)}-${formattedParentId.substring(16, 20)}-${formattedParentId.substring(20)}`;
      }
      
      const cleanTemplateId = sanitizeGuid(request.templateId);
      // Format template ID with dashes if missing
      let formattedTemplateId = cleanTemplateId;
      if (!formattedTemplateId.includes('-') && formattedTemplateId.length === 32) {
        formattedTemplateId = `${formattedTemplateId.substring(0, 8)}-${formattedTemplateId.substring(8, 12)}-${formattedTemplateId.substring(12, 16)}-${formattedTemplateId.substring(16, 20)}-${formattedTemplateId.substring(20)}`;
      }
      
      // Validate GUID format after formatting
      const guidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      if (!guidPattern.test(formattedParentId)) {
        throw new Error(`Invalid parent ID format after formatting: ${formattedParentId}`);
      }
      if (!guidPattern.test(formattedTemplateId)) {
        throw new Error(`Invalid template ID format after formatting: ${formattedTemplateId}`);
      }

      // Format fields for GraphQL - ensure proper structure
      const formattedFields = (request.fields || []).map(field => ({
        name: field.name,
        value: field.value || '', // Ensure value is never undefined
      }));

      // Try with 'template' first (XM Cloud standard), then 'templateId' as fallback
      let variables = {
        input: {
          name: request.name,
          parent: formattedParentId,
          template: formattedTemplateId,
          language: request.language || 'en',
          fields: formattedFields,
        },
      };

      logger.debug('Creating item with variables', { 
        name: request.name,
        parent: cleanParentId,
        template: cleanTemplateId,
        language: request.language || 'en',
        fieldCount: formattedFields.length,
      });

      let result;
      try {
        result = await this.executeGraphQL<any>(mutation, variables);
      } catch (firstError) {
        // If 'template' parameter fails, try with 'templateId'
        logger.warn('First attempt with "template" failed, trying "templateId"', {
          error: (firstError as Error).message,
        });
        
        variables = {
          input: {
            name: request.name,
            parent: cleanParentId,
            templateId: cleanTemplateId,
            language: request.language || 'en',
            fields: formattedFields,
          } as any,
        };
        
        result = await this.executeGraphQL<any>(mutation, variables);
      }
      
      if (!result.createItem?.item) {
        throw new Error('API returned success but no item data was provided');
      }
      
      const item = this.mapGraphQLItemToModel(result.createItem.item);

      // Invalidate parent item cache (children list changed)
      const parentCacheKey = `item:${cleanParentId}:${request.language || 'en'}`;
      this.itemCache.delete(parentCacheKey);
      
      logger.info('Item created successfully', {
        id: item.itemId,
        name: item.name,
        path: item.path,
      });

      return item;
    } catch (error) {
      logger.error('Create item failed', error as Error, {
        name: request.name,
        templateId: request.templateId,
        parentPath: request.parentPath,
      });
      throw this.handleError(error, 'Failed to create item');
    }
  }

  /**
   * Update an existing item
   */
  async updateItem(id: string, request: UpdateItemRequest): Promise<SitecoreItem> {
    const mutation = `
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
    `;

    try {
      const cleanId = sanitizeGuid(id);
      
      // Format the GUID with dashes if needed
      let formattedId = cleanId;
      if (!formattedId.includes('-') && formattedId.length === 32) {
        formattedId = `${formattedId.substring(0, 8)}-${formattedId.substring(8, 12)}-${formattedId.substring(12, 16)}-${formattedId.substring(16, 20)}-${formattedId.substring(20)}`;
      }
      
      const variables = {
        input: {
          itemId: formattedId,
          language: request.language || 'en',
          name: request.name,
          fields: request.fields || [],
        },
      };

      logger.debug('Updating item', { 
        itemId: formattedId, 
        language: request.language || 'en',
        fieldsCount: request.fields?.length || 0,
        fields: request.fields
      });

      const result = await this.executeGraphQL<any>(mutation, variables);
      
      logger.debug('Update result', { 
        success: !!result.updateItem?.item,
        itemId: result.updateItem?.item?.itemId
      });
      
      return this.mapGraphQLItemToModel(result.updateItem.item);
    } catch (error) {
      logger.error('Update item failed', error as Error, {
        itemId: id,
        fields: request.fields
      });
      throw this.handleError(error, `Failed to update item ${id}`);
    }
  }

  /**
   * Delete an item
   */
  async deleteItem(id: string): Promise<void> {
    const mutation = `
      mutation DeleteItem($input: DeleteItemInput!) {
        deleteItem(input: $input) {
          successful
        }
      }
    `;

    try {
      let itemId = id.replace(/[{}]/g, '');
      
      // Format GUID with dashes if missing (32 chars without dashes)
      if (!itemId.includes('-') && itemId.length === 32) {
        itemId = `${itemId.substring(0, 8)}-${itemId.substring(8, 12)}-${itemId.substring(12, 16)}-${itemId.substring(16, 20)}-${itemId.substring(20)}`;
      }
      
      await this.executeGraphQL(mutation, {
        input: { item: itemId },
      });
    } catch (error) {
      throw this.handleError(error, `Failed to delete item ${id}`);
    }
  }

  /**
   * Move an item
   */
  async moveItem(id: string, request: MoveItemRequest): Promise<SitecoreItem> {
    const mutation = `
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
    `;

    try {
      const variables = {
        input: {
          item: id.replace(/[{}]/g, ''),
          targetParent: request.targetParentId.replace(/[{}]/g, ''),
        },
      };

      const result = await this.executeGraphQL<any>(mutation, variables);
      return this.mapGraphQLItemToModel(result.moveItem.item);
    } catch (error) {
      throw this.handleError(error, `Failed to move item ${id}`);
    }
  }

  /**
   * Search items
   */
  async searchItems(params: {
    templateId?: string;
    templateName?: string;
    nameContains?: string;
    path?: string;
    language?: string;
    limit?: number;
  }): Promise<SitecoreItem[]> {
    const variables: any = {
      first: params.limit || 20,
      language: params.language || 'en',
    };

    try {
      const result = await this.executeGraphQL<any>(
        ITEM_QUERIES.SEARCH_ITEMS,
        variables
      );
      const results = result.search?.results || [];
      return results.map((item: any) => this.mapGraphQLItemToModel(item));
    } catch (error) {
      throw this.handleError(error, 'Failed to search items');
    }
  }

  /**
   * Publish an item
   */
  async publishItem(request: PublishItemRequest): Promise<any> {
    const mutation = `
      mutation PublishItem($input: PublishItemInput!) {
        publishItem(input: $input) {
          operationId
        }
      }
    `;

    try {
      let itemId = request.itemId.replace(/[{}]/g, '');
      
      // Format GUID with dashes if missing (32 chars without dashes)
      if (!itemId.includes('-') && itemId.length === 32) {
        itemId = `${itemId.substring(0, 8)}-${itemId.substring(8, 12)}-${itemId.substring(12, 16)}-${itemId.substring(16, 20)}-${itemId.substring(20)}`;
      }
      
      const variables = {
        input: {
          rootItemId: itemId,
          languages: [request.language || 'en'],
          publishItemMode: request.deep ? 'FULL' : 'SMART',
          targetDatabases: request.targets || ['web'],
        },
      };

      const result = await this.executeGraphQL<any>(mutation, variables);
      return {
        success: true,
        operationId: result.publishItem?.operationId,
        status: 'Queued',
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to publish item');
    }
  }

  /**
   * Publish a tree
   */
  async publishTree(request: PublishTreeRequest): Promise<any> {
    const mutation = `
      mutation PublishTree($input: PublishItemInput!) {
        publishItem(input: $input) {
          operationId
        }
      }
    `;

    try {
      let rootItemId = request.rootItemId.replace(/[{}]/g, '');
      
      // Format GUID with dashes if missing (32 chars without dashes)
      if (!rootItemId.includes('-') && rootItemId.length === 32) {
        rootItemId = `${rootItemId.substring(0, 8)}-${rootItemId.substring(8, 12)}-${rootItemId.substring(12, 16)}-${rootItemId.substring(16, 20)}-${rootItemId.substring(20)}`;
      }
      
      const variables = {
        input: {
          rootItemId: rootItemId,
          languages: [request.language || 'en'],
          publishItemMode: 'FULL',
          targetDatabases: request.targets || ['web'],
        },
      };

      const result = await this.executeGraphQL<any>(mutation, variables);
      return {
        success: true,
        operationId: result.publishItem?.operationId,
        status: 'Queued',
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to publish tree');
    }
  }

  /**
   * Get publish status
   */
  async getPublishStatus(jobId?: string): Promise<any> {
    // This is a placeholder - actual implementation depends on Sitecore API
    // You may need to use Sitecore's publishing service API
    return {
      activeJobs: 0,
      queuedJobs: 0,
      message: 'Publishing status check not fully implemented yet',
    };
  }

  /**
   * Upload media
   */
  async uploadMedia(request: UploadMediaRequest): Promise<SitecoreItem> {
    const mutation = `
      mutation CreateMediaItem($input: CreateItemInput!) {
        createItem(input: $input) {
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
    `;

    try {
      // Resolve parent path
      const parentItem = await this.getItemByPath(request.parentPath);
      const parentId = (parentItem.itemId || parentItem.id).replace(/[{}]/g, '');

      // Determine media template based on MIME type
      let templateId = '0603F166-35B8-469F-8123-E8D87BEAEFF9'; // Default File template
      if (request.mimeType.startsWith('image/')) {
        templateId = '962B53C4-7F3C-4EB1-8778-D288EB9F5612'; // Unversioned Image template
      }

      const variables = {
        input: {
          name: request.name,
          parent: parentId,
          template: templateId,
          language: 'en',
          fields: [
            {
              name: 'Media',
              value: request.fileData, // Base64 encoded
            },
          ],
        },
      };

      const result = await this.executeGraphQL<any>(mutation, variables);
      const mediaItem = this.mapGraphQLItemToModel(result.createItem.item);

      // Update owner after creation
      try {
        const mediaId = mediaItem.itemId || mediaItem.id;
        logger.info('Setting media owner', { 
          mediaId: mediaId,
          owner: SITECORE_MCP_OWNER
        });
        await this.setItemOwner(mediaId, SITECORE_MCP_OWNER, 'en');
        logger.info('Media owner updated successfully', { 
          mediaId: mediaId,
          owner: SITECORE_MCP_OWNER
        });
      } catch (error) {
        logger.warn('Failed to set media owner', { 
          error: (error as Error).message,
          mediaId: mediaItem.itemId,
          owner: SITECORE_MCP_OWNER,
          errorDetails: (error as Error).message
        });
      }

      return mediaItem;
    } catch (error) {
      throw this.handleError(error, 'Failed to upload media');
    }
  }

  /**
   * Map GraphQL template response to model
   */
  private mapGraphQLTemplateToModel(graphqlTemplate: any): SitecoreTemplate {
    if (!graphqlTemplate) {
      throw new Error('Template data is null or undefined');
    }
    
    return {
      id: graphqlTemplate.templateId,
      templateId: graphqlTemplate.templateId,
      name: graphqlTemplate.name,
      fullName: graphqlTemplate.fullName,
      icon: graphqlTemplate.icon,
      fields: graphqlTemplate.ownFields?.edges?.map((edge: any) => ({
        name: edge.node.name,
        type: edge.node.type,
        defaultValue: edge.node.defaultValue,
        description: edge.node.description,
      })) || [],
      sections: graphqlTemplate.sections?.edges?.map((edge: any) => ({
        name: edge.node.name,
        sortOrder: edge.node.sortOrder,
        icon: edge.node.icon,
      })) || [],
      baseTemplates: graphqlTemplate.baseTemplates?.edges?.map((edge: any) => ({
        templateId: edge.node.templateId,
        name: edge.node.name,
      })) || [],
    };
  }

  /**
   * Map GraphQL item response to model
   */
  private mapGraphQLItemToModel(graphqlItem: any): SitecoreItem {
    const fields: Record<string, any> = {};
    if (graphqlItem.fields) {
      // Handle both old format (array) and new format (edges/nodes)
      if (graphqlItem.fields.edges) {
        // New format: fields { edges { node { name value } } }
        graphqlItem.fields.edges.forEach((edge: any) => {
          if (edge.node) {
            fields[edge.node.name] = edge.node.value;
          }
        });
      } else if (Array.isArray(graphqlItem.fields)) {
        // Old format: fields { name value }[]
        graphqlItem.fields.forEach((field: any) => {
          fields[field.name] = field.value;
        });
      }
    }

    return {
      id: graphqlItem.itemId,
      itemId: graphqlItem.itemId,
      name: graphqlItem.name,
      displayName: graphqlItem.displayName || graphqlItem.name,
      path: graphqlItem.path,
      templateId: graphqlItem.template?.templateId || graphqlItem.template?.id || '',
      templateName: graphqlItem.template?.name || '',
      hasChildren: graphqlItem.hasChildren,
      created: graphqlItem.created,
      updated: graphqlItem.updated,
      fields,
    };
  }

  /**
   * Get the static owner for created items
   * This is hardcoded and cannot be changed by users
   */
  getDefaultOwner(): string {
    return SITECORE_MCP_OWNER;
  }

  /**
   * Set item owner using multiple strategies
   * System fields like __Owner require special handling in Sitecore
   * Public method that can be used by tools
   */
  async setItemOwner(itemId: string, owner: string, language: string = 'en'): Promise<void> {
    const cleanId = sanitizeGuid(itemId);
    
    // Format GUID with dashes
    let formattedId = cleanId;
    if (!formattedId.includes('-') && formattedId.length === 32) {
      formattedId = `${formattedId.substring(0, 8)}-${formattedId.substring(8, 12)}-${formattedId.substring(12, 16)}-${formattedId.substring(16, 20)}-${formattedId.substring(20)}`;
    }
    
    logger.debug('Attempting to set owner', { 
      itemId: formattedId, 
      owner,
      language 
    });
    
    // Strategy 1: Try standard updateItem mutation with version parameter
    try {
      const mutation1 = `
        mutation UpdateItemOwner($itemId: ID!, $language: String!, $owner: String!) {
          updateItem(
            input: {
              itemId: $itemId
              language: $language
              version: 1
              fields: [
                {
                  name: "__Owner"
                  value: $owner
                }
              ]
            }
          ) {
            item {
              itemId
              name
              fields {
                name
                value
              }
            }
          }
        }
      `;
      
      const result1 = await this.executeGraphQL<any>(mutation1, {
        itemId: formattedId,
        language: language,
        owner: owner
      });
      
      // Verify the owner was set
      const ownerField = result1.updateItem?.item?.fields?.find((f: any) => f.name === '__Owner');
      if (ownerField && ownerField.value === owner) {
        logger.info('Owner set successfully (Strategy 1)', { itemId: formattedId, owner });
        return;
      }
      
      logger.warn('Strategy 1 completed but owner not confirmed', { 
        itemId: formattedId,
        expectedOwner: owner,
        actualOwner: ownerField?.value
      });
    } catch (error1) {
      logger.warn('Strategy 1 failed', { 
        error: (error1 as Error).message,
        itemId: formattedId
      });
    }
    
    // Strategy 2: Try with item parameter instead of itemId
    try {
      const mutation2 = `
        mutation UpdateItemOwner($item: ID!, $language: String!, $owner: String!) {
          updateItem(
            input: {
              item: $item
              language: $language
              fields: [
                {
                  name: "__Owner"
                  value: $owner
                }
              ]
            }
          ) {
            item {
              itemId
              fields {
                name
                value
              }
            }
          }
        }
      `;
      
      const result2 = await this.executeGraphQL<any>(mutation2, {
        item: formattedId,
        language: language,
        owner: owner
      });
      
      const ownerField = result2.updateItem?.item?.fields?.find((f: any) => f.name === '__Owner');
      if (ownerField && ownerField.value === owner) {
        logger.info('Owner set successfully (Strategy 2)', { itemId: formattedId, owner });
        return;
      }
      
      logger.warn('Strategy 2 completed but owner not confirmed', { 
        itemId: formattedId,
        expectedOwner: owner,
        actualOwner: ownerField?.value
      });
    } catch (error2) {
      logger.warn('Strategy 2 failed', { 
        error: (error2 as Error).message,
        itemId: formattedId
      });
    }
    
    // Strategy 3: Try with field ID instead of field name
    try {
      const mutation3 = `
        mutation UpdateItemOwner($itemId: ID!, $language: String!, $owner: String!) {
          updateItem(
            input: {
              itemId: $itemId
              language: $language
              fields: [
                {
                  fieldId: "5DD74568-4D4B-44C1-B513-0AF5F4CDA34F"
                  value: $owner
                }
              ]
            }
          ) {
            item {
              itemId
              fields {
                name
                value
              }
            }
          }
        }
      `;
      
      const result3 = await this.executeGraphQL<any>(mutation3, {
        itemId: formattedId,
        language: language,
        owner: owner
      });
      
      const ownerField = result3.updateItem?.item?.fields?.find((f: any) => f.name === '__Owner');
      if (ownerField && ownerField.value === owner) {
        logger.info('Owner set successfully (Strategy 3)', { itemId: formattedId, owner });
        return;
      }
      
      logger.warn('Strategy 3 completed but owner not confirmed', { 
        itemId: formattedId,
        expectedOwner: owner,
        actualOwner: ownerField?.value
      });
    } catch (error3) {
      logger.warn('Strategy 3 failed', { 
        error: (error3 as Error).message,
        itemId: formattedId
      });
    }
    
    // If all strategies failed, throw error
    throw new Error(`Failed to set owner field using all available strategies. Owner field may not be editable via GraphQL API.`);
  }

  /**
   * Cache management methods
   */
  
  /**
   * Clear template cache
   */
  clearTemplateCache(): void {
    this.templateCache.clear();
    logger.info('Template cache cleared');
  }

  /**
   * Clear item cache
   */
  clearItemCache(): void {
    this.itemCache.clear();
    logger.info('Item cache cleared');
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.cacheManager.clearAll();
    logger.info('All caches cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): any {
    return {
      templates: this.templateCache.getStats(),
      items: this.itemCache.getStats(),
      all: this.cacheManager.getAllStats(),
    };
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus(): {
    state: string;
    failures: number;
  } {
    return {
      state: this.circuitBreaker.getState(),
      failures: this.circuitBreaker.getFailures(),
    };
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker(): void {
    this.circuitBreaker.reset();
    logger.info('Circuit breaker reset');
  }

  /**
   * Get rate limiter status
   */
  getRateLimiterStatus(): {
    availableTokens: number;
  } {
    return {
      availableTokens: this.rateLimiter.getAvailableTokens(),
    };
  }

  /**
   * Handle API errors
   */
  private handleError(error: unknown, defaultMessage: string): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const responseData = axiosError.response?.data as any;
      const message = responseData?.message || axiosError.message;
      const statusCode = axiosError.response?.status;
      
      // Extract detailed error information
      let detailedMessage = message;
      if (responseData?.errors && Array.isArray(responseData.errors)) {
        const errorDetails = responseData.errors.map((e: any) => e.message || e).join('; ');
        detailedMessage = `${message}. Details: ${errorDetails}`;
      }
      
      logger.error(defaultMessage, axiosError, {
        status: statusCode,
        url: axiosError.config?.url,
        responseData,
      });
      
      return new Error(`${defaultMessage}: ${detailedMessage} (Status: ${statusCode})`);
    }
    
    if (error instanceof Error) {
      // Check if it's a GraphQL error from executeGraphQL
      if (error.message.includes('GraphQL Error:')) {
        logger.error(defaultMessage, error, { graphqlError: error.message });
        return new Error(`${defaultMessage}: ${error.message}`);
      }
      
      logger.error(defaultMessage, error);
      return new Error(`${defaultMessage}: ${error.message}`);
    }
    
    logger.error(defaultMessage, new Error(String(error)));
    return new Error(`${defaultMessage}: ${String(error)}`);
  }
}

