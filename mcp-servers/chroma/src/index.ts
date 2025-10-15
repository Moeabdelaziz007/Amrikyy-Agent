#d
!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import * as chromadb from 'chromadb';

const CHROMA_HOST = process.env.CHROMA_HOST || 'localhost';
const CHROMA_PORT = parseInt(process.env.CHROMA_PORT || '8000');

class ChromaMCPServer {
  private server: Server;
  private client: chromadb.ChromaClient;

  constructor() {
    this.server = new Server(
      {
        name: 'chroma-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize ChromaDB client
    this.client = new chromadb.ChromaClient({
      path: `http://${CHROMA_HOST}:${CHROMA_PORT}`
    });

    this.setupToolHandlers();

    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'create_collection',
          description: 'Create a new collection in ChromaDB',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Collection name',
              },
              metadata: {
                type: 'object',
                description: 'Optional metadata for the collection',
                additionalProperties: true,
              },
            },
            required: ['name'],
          },
        },
        {
          name: 'add_documents',
          description: 'Add documents to a collection',
          inputSchema: {
            type: 'object',
            properties: {
              collection_name: {
                type: 'string',
                description: 'Name of the collection',
              },
              documents: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'Array of document texts',
              },
              metadatas: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: true,
                },
                description: 'Array of metadata objects for each document',
              },
              ids: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'Array of IDs for each document',
              },
            },
            required: ['collection_name', 'documents'],
          },
        },
        {
          name: 'query_collection',
          description: 'Query documents in a collection',
          inputSchema: {
            type: 'object',
            properties: {
              collection_name: {
                type: 'string',
                description: 'Name of the collection',
              },
              query_text: {
                type: 'string',
                description: 'Query text to search for',
              },
              n_results: {
                type: 'number',
                description: 'Number of results to return',
                default: 5,
              },
              where: {
                type: 'object',
                description: 'Optional filter conditions',
                additionalProperties: true,
              },
            },
            required: ['collection_name', 'query_text'],
          },
        },
        {
          name: 'list_collections',
          description: 'List all collections in the database',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'create_collection':
            return await this.handleCreateCollection(request.params.arguments);
          case 'add_documents':
            return await this.handleAddDocuments(request.params.arguments);
          case 'query_collection':
            return await this.handleQueryCollection(request.params.arguments);
          case 'list_collections':
            return await this.handleListCollections(request.params.arguments);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async handleCreateCollection(args: any) {
    const { name, metadata } = args;
    const collection = await this.client.createCollection({
      name,
      metadata,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Collection '${name}' created successfully`,
        },
      ],
    };
  }

  private async handleAddDocuments(args: any) {
    const { collection_name, documents, metadatas, ids } = args;

    const collection = await this.client.getOrCreateCollection({
      name: collection_name,
    });

    await collection.add({
      documents,
      metadatas,
      ids,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Added ${documents.length} documents to collection '${collection_name}'`,
        },
      ],
    };
  }

  private async handleQueryCollection(args: any) {
    const { collection_name, query_text, n_results = 5, where } = args;

    const collection = await this.client.getOrCreateCollection({
      name: collection_name,
    });

    const results = await collection.query({
      queryTexts: [query_text],
      nResults: n_results,
      where,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  }

  private async handleListCollections(args: any) {
    const collections = await this.client.listCollections();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(collections, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Chroma MCP server running on stdio');
  }
}

eonst server = new ChromaMCPServer();
server.run().catch(console.error);
