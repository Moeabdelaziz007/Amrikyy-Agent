-- ============================================
-- OPENMEMORY MCP - DATABASE SCHEMA
-- Supabase Migration for Long-Term Memory
-- COPY THIS ENTIRE FILE TO SUPABASE SQL EDITOR
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- AGENT MEMORY TABLE
-- Stores long-term memory for agents with AIX context
-- ============================================

CREATE TABLE IF NOT EXISTS agent_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Memory identification
  key VARCHAR(255) NOT NULL,
  value JSONB NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'ephemeral', 'short_term', 'long_term'
  content_type VARCHAR(100), -- e.g., 'component', 'task', 'conversation'
  
  -- AIX Context (from meta.openmemory)
  user_id VARCHAR(255),
  project_id VARCHAR(255),
  namespace VARCHAR(255) DEFAULT 'default',
  agent_id VARCHAR(255) NOT NULL,
  
  -- Metadata
  metadata JSONB,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes will be created below
  CONSTRAINT valid_type CHECK (type IN ('ephemeral', 'short_term', 'long_term'))
);

-- ============================================
-- PATTERN LEARNING TABLE
-- Stores learned patterns for adaptive behavior
-- ============================================

CREATE TABLE IF NOT EXISTS pattern_learning (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Pattern identification
  pattern TEXT NOT NULL,
  context VARCHAR(255) NOT NULL,
  
  -- Learning metrics
  frequency INTEGER DEFAULT 1,
  confidence FLOAT DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  
  -- AIX Context
  user_id VARCHAR(255),
  project_id VARCHAR(255),
  namespace VARCHAR(255) DEFAULT 'default',
  agent_id VARCHAR(255) NOT NULL,
  
  -- Metadata
  metadata JSONB,
  
  -- Timestamps
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint on pattern per agent/context
  UNIQUE(pattern, context, agent_id, user_id, project_id)
);

-- ============================================
-- USER PREFERENCES TABLE
-- Stores user-specific preferences and learning
-- ============================================

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User identification (can link to auth.users if using Supabase Auth)
  user_id VARCHAR(255) NOT NULL,
  
  -- Preference data
  preference_key VARCHAR(255) NOT NULL,
  preference_value JSONB NOT NULL,
  
  -- Learning metrics
  confidence FLOAT DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  frequency INTEGER DEFAULT 1,
  
  -- Context
  project_id VARCHAR(255),
  namespace VARCHAR(255) DEFAULT 'default',
  
  -- Timestamps
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint
  UNIQUE(user_id, preference_key, project_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Agent Memory indexes
CREATE INDEX idx_agent_memory_key ON agent_memory(key);
CREATE INDEX idx_agent_memory_agent ON agent_memory(agent_id);
CREATE INDEX idx_agent_memory_user ON agent_memory(user_id);
CREATE INDEX idx_agent_memory_project ON agent_memory(project_id);
CREATE INDEX idx_agent_memory_namespace ON agent_memory(namespace);
CREATE INDEX idx_agent_memory_type ON agent_memory(type);
CREATE INDEX idx_agent_memory_content_type ON agent_memory(content_type);
CREATE INDEX idx_agent_memory_created ON agent_memory(created_at DESC);
CREATE INDEX idx_agent_memory_expires ON agent_memory(expires_at);

-- Composite index for common queries
CREATE INDEX idx_agent_memory_context ON agent_memory(agent_id, user_id, project_id, namespace);

-- Pattern Learning indexes
CREATE INDEX idx_pattern_learning_agent ON pattern_learning(agent_id);
CREATE INDEX idx_pattern_learning_context ON pattern_learning(context);
CREATE INDEX idx_pattern_learning_confidence ON pattern_learning(confidence DESC);
CREATE INDEX idx_pattern_learning_user ON pattern_learning(user_id);
CREATE INDEX idx_pattern_learning_project ON pattern_learning(project_id);
CREATE INDEX idx_pattern_learning_namespace ON pattern_learning(namespace);

-- User Preferences indexes
CREATE INDEX idx_user_preferences_user ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_key ON user_preferences(preference_key);
CREATE INDEX idx_user_preferences_project ON user_preferences(project_id);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE
-- ============================================

-- Auto-update updated_at column for agent_memory
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agent_memory_updated_at
BEFORE UPDATE ON agent_memory
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CLEANUP FUNCTIONS
-- ============================================

-- Function to cleanup expired memory
CREATE OR REPLACE FUNCTION cleanup_expired_memory()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM agent_memory
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old ephemeral memory (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_ephemeral()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM agent_memory
  WHERE type = 'ephemeral' 
    AND created_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant permissions to authenticated role
GRANT ALL ON agent_memory TO authenticated;
GRANT ALL ON pattern_learning TO authenticated;
GRANT ALL ON user_preferences TO authenticated;

-- Grant permissions to anon role (read-only for some tables)
GRANT SELECT ON agent_memory TO anon;
GRANT SELECT ON pattern_learning TO anon;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE agent_memory IS 'OpenMemory MCP: Long-term memory storage for agents with AIX context tracking';
COMMENT ON TABLE pattern_learning IS 'OpenMemory MCP: Learned patterns for adaptive agent behavior';
COMMENT ON TABLE user_preferences IS 'OpenMemory MCP: User-specific preferences and learning data';

COMMENT ON COLUMN agent_memory.user_id IS 'AIX meta.openmemory.user_id - User context for memory';
COMMENT ON COLUMN agent_memory.project_id IS 'AIX meta.openmemory.project_id - Project context for memory';
COMMENT ON COLUMN agent_memory.namespace IS 'AIX meta.openmemory.namespace - Logical namespace for memory isolation';

-- ============================================
-- VERIFICATION
-- ============================================

-- Check if tables were created successfully
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('agent_memory', 'pattern_learning', 'user_preferences');

-- SUCCESS MESSAGE
DO $$ 
BEGIN 
  RAISE NOTICE '✅ OpenMemory MCP tables created successfully!';
  RAISE NOTICE '✅ agent_memory - Ready';
  RAISE NOTICE '✅ pattern_learning - Ready';
  RAISE NOTICE '✅ user_preferences - Ready';
  RAISE NOTICE '🎉 Your database is ready for Amrikyy-Agent MVP!';
END $$;
