import { Client } from 'langsmith';

const langsmithClient = new Client({
  apiKey: process.env.LANGCHAIN_API_KEY,
  apiUrl: process.env.LANGCHAIN_ENDPOINT || 'https://api.smith.langchain.com',
});

export default langsmithClient;

// إعدادات المشروع
export const LANGCHAIN_PROJECT = process.env.LANGCHAIN_PROJECT || 'maya-travel-agent';

// إعدادات التتبع
export const TRACING_CONFIG = {
  projectName: LANGCHAIN_PROJECT,
  tags: ['maya-travel-agent', 'production'],
  metadata: {
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },
};
