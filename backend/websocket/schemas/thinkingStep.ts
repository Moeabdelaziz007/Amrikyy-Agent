import { z } from 'zod';

/**
 * ThinkingStep Schema - Zod Validation
 * Used for both WebSocket messages and API requests
 */
export const ThinkingStepSchema = z.object({
  id: z.string().optional(),
  agent: z.string().min(1, 'Agent name required'),
  action: z.string().min(1, 'Action required'),
  status: z.enum(['pending', 'processing', 'complete', 'error']),
  timestamp: z.number().positive(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  details: z.string().optional(),
  
  // MCO Structure
  mind: z.object({
    sources: z.array(z.string()).optional(),
    confidence: z.number().min(0).max(1).optional(),
    reasoning: z.string().optional()
  }).optional(),
  
  concept: z.object({
    architecture: z.string().optional(),
    dependencies: z.array(z.string()).optional(),
    implementation: z.string().optional()
  }).optional(),
  
  output: z.object({
    result: z.any().optional(),
    metrics: z.record(z.number()).optional(),
    evaluation: z.string().optional()
  }).optional()
});

export type ThinkingStep = z.infer<typeof ThinkingStepSchema>;

/**
 * WebSocket Message Schema
 */
export const WSMessageSchema = z.object({
  type: z.enum(['execute', 'subscribe', 'ping', 'topology', 'insights']),
  agentId: z.string().optional(),
  task: z.any().optional(),
  data: z.any().optional()
});

export type WSMessage = z.infer<typeof WSMessageSchema>;

