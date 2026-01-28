/**
 * MCP Tools for Sitecore GraphQL Operations
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { SitecoreClient } from '../sitecore-client.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('GraphQLTools');

export function createGraphQLTools(client: SitecoreClient): Tool[] {
  return [
    {
      name: 'sitecore_execute_graphql',
      description: 'Execute any GraphQL query or mutation against Sitecore XM Cloud. This is a powerful tool for custom queries not covered by other tools. Returns the raw GraphQL response.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The GraphQL query or mutation to execute (e.g., "query { item(path: \\"/sitecore\\") { name } }")',
          },
          variables: {
            type: 'object',
            description: 'Variables for the GraphQL query (optional)',
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'sitecore_introspect_schema',
      description: 'Introspect the Sitecore GraphQL schema to discover available types, fields, and operations. Useful for exploring the API capabilities.',
      inputSchema: {
        type: 'object',
        properties: {
          typeName: {
            type: 'string',
            description: 'Optional: Get details for a specific type (e.g., "Item", "ItemTemplate"). If omitted, returns full schema overview.',
          },
        },
      },
    },
  ];
}

export async function handleGraphQLTool(
  toolName: string,
  args: any,
  client: SitecoreClient
): Promise<any> {
  try {
    switch (toolName) {
      case 'sitecore_execute_graphql': {
        if (!args.query) {
          return {
            content: [
              {
                type: 'text',
                text: '❌ Error: GraphQL query is required.\n\nExample:\n```graphql\nquery {\n  item(path: "/sitecore") {\n    name\n    id\n    children {\n      name\n    }\n  }\n}\n```',
              },
            ],
            isError: true,
          };
        }

        logger.info('Executing custom GraphQL query', {
          queryPreview: args.query.substring(0, 100) + '...',
          hasVariables: !!args.variables,
        });

        try {
          const result = await executeGraphQLQuery(client, args.query, args.variables || {});

          let responseText = '✅ GraphQL Query Executed Successfully\n\n';
          responseText += '📊 Result:\n';
          responseText += '```json\n';
          responseText += JSON.stringify(result, null, 2);
          responseText += '\n```\n';

          return {
            content: [
              {
                type: 'text',
                text: responseText,
              },
            ],
            isError: false,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          let friendlyError = '❌ GraphQL Execution Failed\n\n';
          friendlyError += `Error: ${errorMessage}\n\n`;
          
          if (errorMessage.includes('syntax') || errorMessage.includes('Syntax')) {
            friendlyError += '💡 Tip: Check your GraphQL syntax. Common issues:\n';
            friendlyError += '- Missing closing braces\n';
            friendlyError += '- Invalid field names\n';
            friendlyError += '- Incorrect variable usage\n';
          } else if (errorMessage.includes('Cannot query field')) {
            friendlyError += '💡 Tip: The field you\'re querying doesn\'t exist. Use sitecore_introspect_schema to explore available fields.\n';
          } else if (errorMessage.includes('Variable')) {
            friendlyError += '💡 Tip: Check your variable definitions and usage.\n';
          }

          return {
            content: [
              {
                type: 'text',
                text: friendlyError,
              },
            ],
            isError: true,
          };
        }
      }

      case 'sitecore_introspect_schema': {
        logger.info('Introspecting GraphQL schema', { typeName: args.typeName });

        const introspectionQuery = args.typeName
          ? `
            query IntrospectType($name: String!) {
              __type(name: $name) {
                name
                kind
                description
                fields {
                  name
                  description
                  type {
                    name
                    kind
                    ofType {
                      name
                      kind
                    }
                  }
                  args {
                    name
                    description
                    type {
                      name
                      kind
                    }
                  }
                }
                interfaces {
                  name
                }
                possibleTypes {
                  name
                }
              }
            }
          `
          : `
            query IntrospectSchema {
              __schema {
                queryType {
                  name
                  fields {
                    name
                    description
                  }
                }
                mutationType {
                  name
                  fields {
                    name
                    description
                  }
                }
                types {
                  name
                  kind
                  description
                }
              }
            }
          `;

        const variables = args.typeName ? { name: args.typeName } : {};

        try {
          const result = await executeGraphQLQuery(client, introspectionQuery, variables);

          let responseText = '✅ GraphQL Schema Introspection\n\n';

          if (args.typeName) {
            const typeInfo = result.__type;
            if (!typeInfo) {
              return {
                content: [
                  {
                    type: 'text',
                    text: `❌ Type "${args.typeName}" not found in schema.\n\n💡 Run without typeName parameter to see all available types.`,
                  },
                ],
                isError: true,
              };
            }

            responseText += `## Type: ${typeInfo.name}\n\n`;
            responseText += `**Kind:** ${typeInfo.kind}\n`;
            if (typeInfo.description) {
              responseText += `**Description:** ${typeInfo.description}\n`;
            }
            responseText += '\n';

            if (typeInfo.fields && typeInfo.fields.length > 0) {
              responseText += `### Fields (${typeInfo.fields.length}):\n\n`;
              typeInfo.fields.forEach((field: any) => {
                responseText += `- **${field.name}**`;
                if (field.type) {
                  const typeName = field.type.name || field.type.ofType?.name || 'Unknown';
                  responseText += `: ${typeName}`;
                }
                if (field.description) {
                  responseText += `\n  ${field.description}`;
                }
                responseText += '\n';
              });
            }

            if (typeInfo.interfaces && typeInfo.interfaces.length > 0) {
              responseText += `\n### Implements:\n`;
              typeInfo.interfaces.forEach((iface: any) => {
                responseText += `- ${iface.name}\n`;
              });
            }
          } else {
            const schema = result.__schema;
            
            responseText += '## Available Operations\n\n';
            
            if (schema.queryType && schema.queryType.fields) {
              responseText += `### Queries (${schema.queryType.fields.length}):\n\n`;
              schema.queryType.fields.slice(0, 10).forEach((field: any) => {
                responseText += `- **${field.name}**`;
                if (field.description) {
                  responseText += `: ${field.description}`;
                }
                responseText += '\n';
              });
              if (schema.queryType.fields.length > 10) {
                responseText += `\n... and ${schema.queryType.fields.length - 10} more queries\n`;
              }
            }

            if (schema.mutationType && schema.mutationType.fields) {
              responseText += `\n### Mutations (${schema.mutationType.fields.length}):\n\n`;
              schema.mutationType.fields.slice(0, 10).forEach((field: any) => {
                responseText += `- **${field.name}**`;
                if (field.description) {
                  responseText += `: ${field.description}`;
                }
                responseText += '\n';
              });
              if (schema.mutationType.fields.length > 10) {
                responseText += `\n... and ${schema.mutationType.fields.length - 10} more mutations\n`;
              }
            }

            if (schema.types) {
              const userTypes = schema.types.filter(
                (t: any) => !t.name.startsWith('__') && 
                           t.kind === 'OBJECT'
              );
              responseText += `\n### Main Types (${userTypes.length}):\n\n`;
              userTypes.slice(0, 20).forEach((type: any) => {
                responseText += `- **${type.name}**`;
                if (type.description) {
                  responseText += `: ${type.description}`;
                }
                responseText += '\n';
              });
              if (userTypes.length > 20) {
                responseText += `\n... and ${userTypes.length - 20} more types\n`;
              }
              responseText += '\n💡 Use `typeName` parameter to get details about a specific type.\n';
            }
          }

          responseText += '\n📋 Raw Schema Data:\n';
          responseText += '```json\n';
          responseText += JSON.stringify(result, null, 2).substring(0, 2000);
          responseText += '\n...\n```';

          return {
            content: [
              {
                type: 'text',
                text: responseText,
              },
            ],
            isError: false,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: 'text',
                text: `❌ Schema Introspection Failed\n\nError: ${errorMessage}`,
              },
            ],
            isError: true,
          };
        }
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: `❌ Unknown GraphQL tool: ${toolName}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('GraphQL tool error', error as Error, { tool: toolName });
    
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error in ${toolName}:\n\n${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}

/**
 * Helper function to execute GraphQL queries
 */
async function executeGraphQLQuery(
  client: SitecoreClient,
  query: string,
  variables: any
): Promise<any> {
  return await client.executeGraphQL(query, variables);
}

