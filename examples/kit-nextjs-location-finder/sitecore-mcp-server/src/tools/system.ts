/**
 * MCP Tools for Sitecore System Operations
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';
import type { SitecoreClient } from '../sitecore-client.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('SystemTools');

export function createSystemTools(client: SitecoreClient): Tool[] {
  return [
    {
      name: 'sitecore_get_languages',
      description: 'Get all configured languages in Sitecore. Returns language codes, display names, and regional information for multi-language content management.',
      inputSchema: {
        type: 'object',
        properties: {
          includeDetails: {
            type: 'boolean',
            description: 'Include detailed language information including regional settings (default: true)',
          },
        },
      },
    },
    {
      name: 'sitecore_reset_circuit_breaker',
      description: 'Reset the Sitecore API circuit breaker. Use this if you get "circuit breaker is OPEN" errors during workflows. This allows operations to continue immediately.',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
    {
      name: 'sitecore_get_circuit_breaker_status',
      description: 'Get the current status of the Sitecore API circuit breaker. Shows state (CLOSED/OPEN/HALF_OPEN) and failure count.',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  ];
}

export async function handleSystemTool(
  toolName: string,
  args: any,
  client: SitecoreClient
): Promise<any> {
  try {
    switch (toolName) {
      case 'sitecore_get_languages': {
        logger.info('Retrieving configured languages');

        const query = `
          query GetLanguages {
            languages: item(where: { path: "/sitecore/system/Languages", language: "en" }) {
              itemId
              name
              path
              children {
                edges {
                  node {
                    itemId
                    name
                    displayName
                    path
                    template {
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
                  }
                }
              }
            }
          }
        `;

        try {
          const result = await client.executeGraphQL(query);

          if (!result.languages) {
            return {
              content: [
                {
                  type: 'text',
                  text: '❌ Unable to retrieve languages. The /sitecore/system/Languages path may not be accessible.',
                },
              ],
              isError: true,
            };
          }

          const languageItems = result.languages.children?.edges || [];

          if (languageItems.length === 0) {
            return {
              content: [
                {
                  type: 'text',
                  text: '⚠️ No languages found in the system.\n\n💡 Languages are typically located at /sitecore/system/Languages',
                },
              ],
              isError: false,
            };
          }

          // Process language items
          const languages = languageItems.map((edge: any) => {
            const item = edge.node;
            const fields: Record<string, string> = {};
            
            if (item.fields?.edges) {
              item.fields.edges.forEach((fieldEdge: any) => {
                fields[fieldEdge.node.name] = fieldEdge.node.value;
              });
            }

            return {
              id: item.itemId,
              name: item.name, // Language code (e.g., "en", "de-DE")
              displayName: item.displayName || fields['Display Name'] || item.name,
              path: item.path,
              iso: fields['Iso'] || item.name,
              charset: fields['Charset'] || 'utf-8',
              codepage: fields['Codepage'] || '',
              encoding: fields['Encoding'] || '',
              regionIsoCode: fields['Regional Iso Code'] || '',
            };
          });

          let responseText = `✅ Sitecore Languages Retrieved\n\n`;
          responseText += `🌍 Total Languages: ${languages.length}\n\n`;

          responseText += `## Configured Languages:\n\n`;
          languages.forEach((lang: any) => {
            responseText += `### ${lang.displayName}\n`;
            responseText += `- **Code:** ${lang.name}\n`;
            responseText += `- **ISO:** ${lang.iso}\n`;
            responseText += `- **Path:** ${lang.path}\n`;
            if (args.includeDetails !== false) {
              if (lang.charset) {
                responseText += `- **Charset:** ${lang.charset}\n`;
              }
              if (lang.regionIsoCode) {
                responseText += `- **Region ISO:** ${lang.regionIsoCode}\n`;
              }
            }
            responseText += `\n`;
          });

          responseText += `## Usage:\n\n`;
          responseText += `Use these language codes when creating or updating content items:\n`;
          languages.forEach((lang: any) => {
            responseText += `- \`${lang.name}\` - ${lang.displayName}\n`;
          });

          responseText += `\n💡 Example: Use \`language: "${languages[0].name}"\` parameter in item operations.\n`;

          responseText += `\n## Detailed Data:\n\n`;
          responseText += '```json\n';
          responseText += JSON.stringify({
            count: languages.length,
            languages: languages,
          }, null, 2);
          responseText += '\n```';

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
          logger.error('Failed to retrieve languages', error as Error);

          return {
            content: [
              {
                type: 'text',
                text: `❌ Failed to retrieve languages:\n\n${errorMessage}\n\n💡 Tip: Ensure you have access to /sitecore/system/Languages`,
              },
            ],
            isError: true,
          };
        }
      }

      case 'sitecore_reset_circuit_breaker': {
        try {
          logger.info('Resetting circuit breaker');
          client.resetCircuitBreaker();
          
          const status = client.getCircuitBreakerStatus();
          
          return {
            content: [
              {
                type: 'text',
                text: `✅ Circuit Breaker Reset Successfully\n\n` +
                      `**Status:** ${status.state}\n` +
                      `**Failures:** ${status.failures}\n\n` +
                      `💡 You can now continue with your operations. If errors persist, check your Sitecore connection and API credentials.`,
              },
            ],
            isError: false,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logger.error('Failed to reset circuit breaker', error as Error);
          
          return {
            content: [
              {
                type: 'text',
                text: `❌ Failed to reset circuit breaker:\n\n${errorMessage}`,
              },
            ],
            isError: true,
          };
        }
      }

      case 'sitecore_get_circuit_breaker_status': {
        try {
          const status = client.getCircuitBreakerStatus();
          const rateLimiterStatus = client.getRateLimiterStatus();
          
          let statusText = `📊 Sitecore API Status\n\n`;
          statusText += `## Circuit Breaker\n`;
          statusText += `- **State:** ${status.state}\n`;
          statusText += `- **Failures:** ${status.failures}/10 (threshold)\n`;
          
          if (status.state === 'OPEN') {
            statusText += `\n⚠️ **Circuit breaker is OPEN** - API calls are currently blocked.\n`;
            statusText += `💡 Use \`sitecore_reset_circuit_breaker\` to reset and continue.\n`;
          } else if (status.state === 'HALF_OPEN') {
            statusText += `\n🟡 **Circuit breaker is HALF_OPEN** - Testing if API is recovering.\n`;
          } else {
            statusText += `\n✅ **Circuit breaker is CLOSED** - All operations are allowed.\n`;
          }
          
          statusText += `\n## Rate Limiter\n`;
          statusText += `- **Available Tokens:** ${rateLimiterStatus.availableTokens}/100\n`;
          
          return {
            content: [
              {
                type: 'text',
                text: statusText,
              },
            ],
            isError: false,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logger.error('Failed to get circuit breaker status', error as Error);
          
          return {
            content: [
              {
                type: 'text',
                text: `❌ Failed to get circuit breaker status:\n\n${errorMessage}`,
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
              text: `❌ Unknown system tool: ${toolName}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('System tool error', error as Error, { tool: toolName });

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

