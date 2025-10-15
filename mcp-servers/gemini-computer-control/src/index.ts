#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { GeminiClient } from './geminiClient.js';
import { ComputerController } from './computerController.js';

class GeminiComputerControlServer {
  private server: Server;
  private geminiClient: GeminiClient;
  private computerController: ComputerController;

  constructor() {
    this.server = new Server(
      {
        name: 'gemini-computer-control-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.geminiClient = new GeminiClient();
    this.computerController = new ComputerController();
    this.setupToolHandlers();

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
          name: 'take_screenshot',
          description: 'Take a screenshot of the current screen',
          inputSchema: {
            type: 'object',
            properties: {
              filename: {
                type: 'string',
                description: 'Optional filename for the screenshot',
              },
            },
          },
        },
        {
          name: 'get_system_info',
          description: 'Get comprehensive system information',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'list_applications',
          description: 'List all installed applications',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'open_application',
          description: 'Open an application by name',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name of the application to open',
              },
            },
            required: ['name'],
          },
        },
        {
          name: 'gemini_analyze_screen',
          description: 'Use Gemini AI to analyze current screen content',
          inputSchema: {
            type: 'object',
            properties: {
              question: {
                type: 'string',
                description: 'Question about the screen content',
              },
            },
            required: ['question'],
          },
        },
        {
          name: 'gemini_control_assistance',
          description: 'Get Gemini AI assistance for computer control tasks',
          inputSchema: {
            type: 'object',
            properties: {
              task: {
                type: 'string',
                description: 'Describe the computer control task',
              },
              context: {
                type: 'string',
                description: 'Additional context about current state',
              },
            },
            required: ['task'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'take_screenshot':
            return await this.handleScreenshot(request.params.arguments);
          case 'get_system_info':
            return await this.handleSystemInfo(request.params.arguments);
          case 'list_applications':
            return await this.handleListApplications(request.params.arguments);
          case 'open_application':
            return await this.handleOpenApplication(request.params.arguments);
          case 'gemini_analyze_screen':
            return await this.handleGeminiAnalyzeScreen(request.params.arguments);
          case 'gemini_control_assistance':
            return await this.handleGeminiControlAssistance(request.params.arguments);
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

  private async handleScreenshot(args: any) {
    const result = await this.computerController.takeScreenshot(args.filename);
    return {
      content: [
        {
          type: 'text',
          text: result.success
            ? `Screenshot saved successfully: ${result.path}`
            : `Failed to take screenshot: ${result.error}`,
        },
      ],
    };
  }

  private async handleSystemInfo(args: any) {
    const result = await this.computerController.getSystemInfo();
    return {
      content: [
        {
          type: 'text',
          text: result.success
            ? JSON.stringify(result.data, null, 2)
            : `Failed to get system info: ${result.error}`,
        },
      ],
    };
  }

  private async handleListApplications(args: any) {
    const result = await this.computerController.listApplications();
    return {
      content: [
        {
          type: 'text',
          text: result.success
            ? JSON.stringify(result.applications, null, 2)
            : `Failed to list applications: ${result.error}`,
        },
      ],
    };
  }

  private async handleOpenApplication(args: any) {
    const { name } = args;
    const result = await this.computerController.openApplication(name);
    return {
      content: [
        {
          type: 'text',
          text: result.success
            ? `Successfully opened application: ${name}`
            : `Failed to open application: ${result.error}`,
        },
      ],
    };
  }

  private async handleGeminiAnalyzeScreen(args: any) {
    const { question } = args;

    // First take a screenshot
    const screenshotResult = await this.computerController.takeScreenshot();
    if (!screenshotResult.success) {
      return {
        content: [
          {
            type: 'text',
            text: `Failed to capture screen for analysis: ${screenshotResult.error}`,
          },
        ],
        isError: true,
      };
    }

    // Use Gemini to analyze the screenshot
    const analysisResult = await this.geminiClient.analyzeImage(screenshotResult.path, question);

    return {
      content: [
        {
          type: 'text',
          text: analysisResult.success
            ? analysisResult.content
            : `Failed to analyze screen: ${analysisResult.error}`,
        },
      ],
    };
  }

  private async handleGeminiControlAssistance(args: any) {
    const { task, context } = args;

    const systemPrompt = `You are an AI assistant helping with computer control tasks.
    Provide clear, step-by-step instructions for computer operations.
    Be specific about UI elements, menu options, and keyboard shortcuts.
    If asked about current screen content, assume you can see what's on screen.`;

    const userPrompt = `Task: ${task}
    ${context ? `Context: ${context}` : ''}

    Provide detailed step-by-step instructions for completing this computer task.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const result = await this.geminiClient.chatCompletion(messages);

    return {
      content: [
        {
          type: 'text',
          text: result.success
            ? result.content
            : `Failed to get assistance: ${result.error}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Gemini Computer Control MCP server running on stdio');
  }
}

const server = new GeminiComputerControlServer();
server.run().catch(console.error);
