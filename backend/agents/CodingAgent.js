/**
 * @fileoverview Coding Agent - A sophisticated agent that orchestrates a team of specialized sub-agents to handle various coding tasks.
 * @module agents/CodingAgent
 * @description This agent acts as a high-level controller, delegating tasks to specialized sub-agents for UI/UX, API design, DevOps, QA, documentation, and code review.
 *
 * @author Ona AI
 * @created 2025-10-23
 */

const { getAi } = require('../services/geminiService');
const logger = require('../utils/logger'); // Assuming a logger utility exists

/**
 * @class CodingAgent
 * @description An agent that orchestrates 6 specialized sub-agents to perform a wide range of coding tasks.
 */
class CodingAgent {
  /**
   * @constructor
   */
  constructor() {
    this.name = 'Coding Agent';
    this.icon = '💻';
    this.description = 'Super coder with 6 specialized sub-agents';

    this.modelName = 'gemini-2.5-pro';

    if (!process.env.API_KEY) {
      logger.warn('[CodingAgent] API_KEY is not set. Coding Agent will not be able to make real API calls.');
    }

    // 6 Sub-Agents with their specializations and system prompts
    this.subAgents = {
      uiux: {
        name: 'UI/UX Expert',
        icon: '🎨',
        expertise: 'Frontend components, responsive design, accessibility, user experience',
        systemPrompt: `You are a UI/UX Expert specializing in:
- Modern frontend frameworks (React, Vue, Angular)
- Responsive design and mobile-first approach
- Accessibility (WCAG standards)
- User experience best practices
- CSS frameworks (Tailwind, Bootstrap)
- Component libraries (shadcn/ui, Material-UI)

Provide clean, production-ready frontend code with best practices.
`
      },

      api: {
        name: 'API Architect',
        icon: '🔌',
        expertise: 'REST/GraphQL APIs, backend logic, database design, authentication',
        systemPrompt: `You are an API Architect specializing in:
- RESTful API design
- GraphQL schemas
- Backend frameworks (Express, FastAPI, Django)
- Database design (SQL, NoSQL)
- Authentication & Authorization (JWT, OAuth)
- API security best practices

Provide scalable, secure backend code with proper error handling.
`
      },

      devops: {
        name: 'DevOps Engineer',
        icon: '🚀',
        expertise: 'CI/CD pipelines, Docker, Kubernetes, cloud deployment, infrastructure',
        systemPrompt: `You are a DevOps Engineer specializing in:
- CI/CD pipelines (GitHub Actions, GitLab CI)
- Containerization (Docker, Docker Compose)
- Orchestration (Kubernetes, Docker Swarm)
- Cloud platforms (AWS, GCP, Azure)
- Infrastructure as Code (Terraform, CloudFormation)
- Monitoring and logging

Provide production-ready deployment configurations.
`
      },

      qa: {
        name: 'QA Specialist',
        icon: '✅',
        expertise: 'Unit tests, integration tests, E2E tests, test coverage',
        systemPrompt: `You are a QA Specialist specializing in:
- Unit testing (Jest, Mocha, Pytest)
- Integration testing
- End-to-end testing (Cypress, Playwright)
- Test-driven development (TDD)
- Code coverage analysis
- Performance testing

Provide comprehensive test suites with high coverage.
`
      },

      docs: {
        name: 'Documentation Writer',
        icon: '📚',
        expertise: 'Code docs, API docs, user guides, README files',
        systemPrompt: `You are a Documentation Writer specializing in:
- Code documentation (JSDoc, Docstrings)
- API documentation (OpenAPI/Swagger)
- User guides and tutorials
- README files
- Architecture diagrams
- Markdown formatting

Provide clear, comprehensive documentation.
`
      },

      reviewer: {
        name: 'Code Reviewer',
        icon: '🔍',
        expertise: 'Code quality, best practices, security, performance',
        systemPrompt: `You are a Code Reviewer specializing in:
- Code quality analysis
- Best practices enforcement
- Security vulnerability detection
- Performance optimization
- Design patterns
- SOLID principles

Provide detailed code reviews with actionable improvements.
`
      }
    };
  }

  /**
   * Executes a task by delegating it to the appropriate sub-agent.
   * @async
   * @method executeTask
   * @param {object} task - The task to execute.
   * @param {string} task.type - The type of task (e.g., 'generateUI', 'designAPI').
   * @returns {Promise<object>} The result from the sub-agent.
   * @throws {Error} If the task type is unknown or the API key is not configured.
   */
  async executeTask(task) {
    logger.info(`[CodingAgent] Executing task: ${task.type}`);

    if (!process.env.API_KEY) {
      throw new Error('API_KEY is not configured. Cannot make real AI calls.');
    }

    try {
      const ai = getAi();
      switch (task.type) {
        case 'generateUI':
          return await this.generateUI(task, ai);

        case 'designAPI':
          return await this.designAPI(task, ai);

        case 'createDeploymentConfig':
          return await this.createDeployment(task, ai);

        case 'writeTests':
          return await this.writeTests(task, ai);

        case 'generateDocumentation':
          return await this.generateDocs(task, ai);

        case 'reviewCode': 
          return await this.reviewCode(task.code, ai);

        case 'refactorCode':
          return await this.refactorCode(task, ai);

        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
    } catch (error) {
      logger.error(`[CodingAgent] Error executing task ${task.type}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * A private method to call the Gemini API with a specific sub-agent's system prompt.
   * @async
   * @private
   * @method _callGemini
   * @param {object} subAgent - The sub-agent to use.
   * @param {string} userPrompt - The user's prompt.
   * @param {object} ai - The Gemini AI client.
   * @returns {Promise<string>} The text response from the Gemini API.
   */
  async _callGemini(subAgent, userPrompt, ai) {
    const result = await ai.models.generateContent({
      model: this.modelName,
      contents: userPrompt,
      config: {
        systemInstruction: subAgent.systemPrompt,
        thinkingConfig: { thinkingBudget: 32768 },
      }
    });
    return result.text;
  }


  /**
   * Sub-Agent 1: UI/UX Expert - Generates frontend code.
   * @async
   * @method generateUI
   * @param {object} task - The UI generation task.
   * @param {object} ai - The Gemini AI client.
   * @returns {Promise<object>} The result of the UI generation.
   */
  async generateUI(task, ai) {
    const subAgent = this.subAgents.uiux;
    const { projectDescription, component, framework } = task;

    const userPrompt = `Generate production-ready frontend code for a "${projectDescription}" project.
Focus on a "${component}" component using the "${framework}" framework.

Key requirements:
- Component structure
- Styling (Tailwind CSS preferred)
- Responsive design
- Accessibility features
- TypeScript types (if applicable)

Provide complete, runnable code.`;

    const response = await this._callGemini(subAgent, userPrompt, ai);

    return {
      success: true,
      subAgent: subAgent.name,
      icon: subAgent.icon,
      result: response,
      message: 'UI component generated successfully'
    };
  }

  /**
   * Sub-Agent 2: API Architect - Designs a backend API.
   * @async
   * @method designAPI
   * @param {object} task - The API design task.
   * @param {object} ai - The Gemini AI client.
   * @returns {Promise<object>} The result of the API design.
   */
  async designAPI(task, ai) {
    const subAgent = this.subAgents.api;
    const { serviceDescription, endpoints, language } = task;

    const userPrompt = `Design a complete API for "${serviceDescription}".
Specify the API endpoints: ${endpoints}.
Target backend language: ${language}.

Include:
1. API endpoints (REST or GraphQL)
2. Request/Response schemas (JSON or GraphQL SDL)
3. Database models (if applicable)
4. Authentication logic (e.g., JWT, OAuth)
5. Error handling
6. Validation examples

Provide complete, production-ready backend code/schema.`;

    const response = await this._callGemini(subAgent, userPrompt, ai);

    return {
      success: true,
      subAgent: subAgent.name,
      icon: subAgent.icon,
      result: response,
      message: 'API design completed successfully'
    };
  }

  /**
   * Sub-Agent 3: DevOps Engineer - Creates deployment configurations.
   * @async
   * @method createDeployment
   * @param {object} task - The deployment task.
   * @param {object} ai - The Gemini AI client.
   * @returns {Promise<object>} The result of the deployment configuration.
   */
  async createDeployment(task, ai) {
    const subAgent = this.subAgents.devops;
    const { serviceDescription, platform, ciCdTool } = task;

    const userPrompt = `Create deployment configuration for a "${serviceDescription}" application.
Target deployment platform: ${platform}.
CI/CD tool: ${ciCdTool}.

Include:
1. Dockerfile
2. docker-compose.yml (if applicable)
3. CI/CD pipeline configuration (e.g., .github/workflows/main.yml)
4. Kubernetes manifests (if needed)
5. Environment variables setup
6. Deployment instructions

Provide complete, production-ready deployment files.`;

    const response = await this._callGemini(subAgent, userPrompt, ai);

    return {
      success: true,
      subAgent: subAgent.name,
      icon: subAgent.icon,
      result: response,
      message: 'Deployment configuration created successfully'
    };
  }

  /**
   * Sub-Agent 4: QA Specialist - Writes test cases.
   * @async
   * @method writeTests
   * @param {object} task - The testing task.
   * @param {object} ai - The Gemini AI client.
   * @returns {Promise<object>} The result of the test generation.
   */
  async writeTests(task, ai) {
    const subAgent = this.subAgents.qa;
    const { feature, testFramework } = task;

    const userPrompt = `Write comprehensive tests for the "${feature}" feature.
Use the "${testFramework}" testing framework.

Include:
1. Unit tests for relevant functions
2. Integration tests for API endpoints (if applicable)
3. Edge cases and error scenarios
4. Test fixtures and mocks
5. Best practices for readable and maintainable tests

Provide complete, runnable test suite.`;

    const response = await this._callGemini(subAgent, userPrompt, ai);

    return {
      success: true,
      subAgent: subAgent.name,
      icon: subAgent.icon,
      result: response,
      message: 'Test suite generated successfully'
    };
  }

  /**
   * Sub-Agent 5: Documentation Writer - Generates documentation.
   * @async
   * @method generateDocs
   * @param {object} task - The documentation task.
   * @param {object} ai - The Gemini AI client.
   * @returns {Promise<object>} The result of the documentation generation.
   */
  async generateDocs(task, ai) {
    const subAgent = this.subAgents.docs;
    const { codeDescription, docType } = task;

    const userPrompt = `Generate comprehensive "${docType}" documentation for the following code/feature description:
"${codeDescription}".

Include:
1. README.md with setup instructions (if project-level)
2. API documentation (if applicable)
3. Code comments (JSDoc/Docstrings)
4. Architecture overview (if applicable)
5. Usage examples
6. Troubleshooting guide (if applicable)

Provide complete, well-formatted documentation.`;

    const response = await this._callGemini(subAgent, userPrompt, ai);

    return {
      success: true,
      subAgent: subAgent.name,
      icon: subAgent.icon,
      result: response,
      message: 'Documentation generated successfully'
    };
  }

  /**
   * Sub-Agent 6: Code Reviewer - Reviews code for quality, security, and performance.
   * @async
   * @method reviewCode
   * @param {string} code - The code to be reviewed.
   * @param {object} ai - The Gemini AI client.
   * @returns {Promise<object>} The result of the code review.
   */
  async reviewCode(code, ai) {
    const subAgent = this.subAgents.reviewer;

    const userPrompt = `Review the following code:
\`\`\`
${code}
\`\`\`

Provide a detailed code review with:
1. Code quality assessment
2. Security vulnerabilities
3. Performance issues
4. Best practices violations
5. Suggested improvements
6. Overall rating (1-10)

Be constructive and specific.`;

    const response = await this._callGemini(subAgent, userPrompt, ai);

    return {
      success: true,
      subAgent: subAgent.name,
      icon: subAgent.icon,
      result: response,
      message: 'Code review completed successfully'
    };
  }

  /**
   * Refactors code based on provided instructions.
   * @async
   * @method refactorCode
   * @param {object} task - The refactoring task.
   * @param {string} task.code - The code to be refactored.
   * @param {string} task.instructions - The refactoring instructions.
   * @param {object} ai - The Gemini AI client.
   * @returns {Promise<object>} The refactored code.
   */
  async refactorCode(task, ai) {
    const subAgent = this.subAgents.reviewer; // A reviewer is good at refactoring
    const { code, instructions } = task;

    const userPrompt = `Refactor the following code based on the provided instructions.
Ensure the refactored code is clean, efficient, and maintains the original functionality unless instructed otherwise.

Instructions: "${instructions}"

Original Code:
\`\`\`
${code}
\`\`\`

Provide ONLY the refactored code block.`;

    const response = await this._callGemini(subAgent, userPrompt, ai);

    return {
      success: true,
      subAgent: subAgent.name,
      icon: subAgent.icon,
      result: response,
      message: 'Code refactored successfully'
    };
  }
}

module.exports = CodingAgent;
