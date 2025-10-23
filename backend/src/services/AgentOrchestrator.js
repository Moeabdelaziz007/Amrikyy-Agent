/**
 * Agent Orchestrator - Central coordination for Mini Agents
 * Manages workflow execution and task delegation
 */

const NavigatorAgent = require('../agents/mini/NavigatorAgent');
const VisionAgent = require('../agents/mini/VisionAgent');
const ResearchAgent = require('../agents/mini/ResearchAgent');
const TranslatorAgent = require('../agents/mini/TranslatorAgent');
const SchedulerAgent = require('../agents/mini/SchedulerAgent');
const StorageAgent = require('../agents/mini/StorageAgent');
const MediaAgent = require('../agents/mini/MediaAgent');
const CommunicatorAgent = require('../agents/mini/CommunicatorAgent');
const logger = require('../utils/logger');

class AgentOrchestrator {
  constructor() {
    this.agents = {
      navigator: new NavigatorAgent(),
      vision: new VisionAgent(),
      research: new ResearchAgent(),
      translator: new TranslatorAgent(),
      scheduler: new SchedulerAgent(),
      storage: new StorageAgent(),
      media: new MediaAgent(),
      communicator: new CommunicatorAgent()
    };

    this.workflows = new Map();
    logger.info('[AgentOrchestrator] Initialized with 8 agents');
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflow) {
    const workflowId = `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info(`[AgentOrchestrator] Executing workflow: ${workflow.name}`);

    const results = {};
    const startTime = Date.now();

    try {
      for (const step of workflow.steps) {
        const stepStartTime = Date.now();
        
        logger.info(`[AgentOrchestrator] Step ${step.id}: ${step.agent}.${step.task.type}`);

        const agent = this.agents[step.agent];
        if (!agent) {
          throw new Error(`Agent not found: ${step.agent}`);
        }

        // Replace placeholders in task with previous results
        const task = this.resolveTaskParameters(step.task, results);

        // Execute task
        const result = await agent.executeTask(task);
        results[step.id] = result;

        const stepDuration = Date.now() - stepStartTime;
        logger.info(`[AgentOrchestrator] Step ${step.id} completed in ${stepDuration}ms`);

        // Pass result to next step if specified
        if (step.passToNext && workflow.steps.indexOf(step) < workflow.steps.length - 1) {
          const nextStep = workflow.steps[workflow.steps.indexOf(step) + 1];
          nextStep.task.input = result;
        }
      }

      const totalDuration = Date.now() - startTime;

      const workflowResult = {
        workflowId,
        name: workflow.name,
        status: 'completed',
        results,
        duration: totalDuration,
        completedAt: new Date()
      };

      this.workflows.set(workflowId, workflowResult);

      return workflowResult;

    } catch (error) {
      logger.error(`[AgentOrchestrator] Workflow error: ${error.message}`);
      
      const workflowResult = {
        workflowId,
        name: workflow.name,
        status: 'failed',
        error: error.message,
        results,
        duration: Date.now() - startTime,
        failedAt: new Date()
      };

      this.workflows.set(workflowId, workflowResult);

      throw error;
    }
  }

  /**
   * Delegate a task to appropriate agent
   */
  async delegateTask(agentName, task) {
    logger.info(`[AgentOrchestrator] Delegating task to ${agentName}`);

    const agent = this.agents[agentName];
    if (!agent) {
      throw new Error(`Agent not found: ${agentName}`);
    }

    return await agent.executeTask(task);
  }

  /**
   * Resolve task parameters with previous results
   */
  resolveTaskParameters(task, results) {
    const resolvedTask = { ...task };

    // Replace placeholders like {{step1.result.value}}
    Object.keys(resolvedTask).forEach(key => {
      if (typeof resolvedTask[key] === 'string' && resolvedTask[key].includes('{{')) {
        const placeholder = resolvedTask[key].match(/\{\{([^}]+)\}\}/);
        if (placeholder) {
          const path = placeholder[1].split('.');
          let value = results;
          
          for (const segment of path) {
            value = value?.[segment];
          }

          if (value !== undefined) {
            resolvedTask[key] = value;
          }
        }
      }
    });

    return resolvedTask;
  }

  /**
   * Get all agents status
   */
  getAllAgentsStatus() {
    const status = {};
    
    Object.entries(this.agents).forEach(([name, agent]) => {
      status[name] = agent.getStatus();
    });

    return {
      success: true,
      agents: status,
      totalAgents: Object.keys(this.agents).length
    };
  }

  /**
   * Get workflow history
   */
  getWorkflowHistory(limit = 10) {
    const workflows = Array.from(this.workflows.values())
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(0, limit);

    return {
      success: true,
      workflows,
      total: this.workflows.size
    };
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    return {
      success: true,
      workflow
    };
  }

  /**
   * Create predefined workflow templates
   */
  getWorkflowTemplates() {
    return {
      success: true,
      templates: [
        {
          id: 'complete-trip-planning',
          name: 'Complete Trip Planning',
          description: 'Plan a complete trip with research, navigation, scheduling, and documentation',
          steps: [
            {
              id: 'step1',
              agent: 'research',
              task: {
                type: 'WEB_SEARCH',
                query: '{{destination}} travel guide'
              }
            },
            {
              id: 'step2',
              agent: 'navigator',
              task: {
                type: 'FIND_NEARBY',
                location: { lat: 0, lng: 0 },
                placeType: 'tourist_attraction'
              }
            },
            {
              id: 'step3',
              agent: 'scheduler',
              task: {
                type: 'CREATE_EVENT',
                event: {
                  title: 'Trip to {{destination}}',
                  startTime: '{{startDate}}',
                  endTime: '{{endDate}}'
                }
              }
            },
            {
              id: 'step4',
              agent: 'storage',
              task: {
                type: 'CREATE_ITINERARY',
                tripData: {
                  destination: '{{destination}}',
                  startDate: '{{startDate}}',
                  endDate: '{{endDate}}'
                }
              }
            },
            {
              id: 'step5',
              agent: 'communicator',
              task: {
                type: 'EMAIL_ITINERARY',
                to: '{{email}}',
                itinerary: '{{step4.itinerary}}'
              }
            }
          ]
        },
        {
          id: 'navigate-foreign-city',
          name: 'Navigate Foreign City',
          description: 'Find places, translate, and get directions in a foreign city',
          steps: [
            {
              id: 'step1',
              agent: 'navigator',
              task: {
                type: 'FIND_NEARBY',
                location: '{{location}}',
                placeType: '{{placeType}}'
              }
            },
            {
              id: 'step2',
              agent: 'research',
              task: {
                type: 'GET_REVIEWS',
                placeName: '{{step1.places[0].name}}'
              }
            },
            {
              id: 'step3',
              agent: 'translator',
              task: {
                type: 'TRANSLATE_TEXT',
                text: '{{step2.reviews[0].snippet}}',
                targetLang: 'en'
              }
            }
          ]
        },
        {
          id: 'research-destination',
          name: 'Research Destination',
          description: 'Comprehensive research about a travel destination',
          steps: [
            {
              id: 'step1',
              agent: 'research',
              task: {
                type: 'WEB_SEARCH',
                query: '{{destination}} travel information'
              }
            },
            {
              id: 'step2',
              agent: 'media',
              task: {
                type: 'SEARCH_TRAVEL_VIDEOS',
                destination: '{{destination}}'
              }
            },
            {
              id: 'step3',
              agent: 'storage',
              task: {
                type: 'SAVE_DOCUMENT',
                content: '{{step1.results}}',
                filename: '{{destination}}-research.txt'
              }
            }
          ]
        }
      ]
    };
  }
}

module.exports = AgentOrchestrator;
