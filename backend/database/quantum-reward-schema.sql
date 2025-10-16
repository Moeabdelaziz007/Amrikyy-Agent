-- ═══════════════════════════════════════════════════════════════
-- 🌌 QUANTUM REWARD ENGINE DATABASE SCHEMA
-- Supabase PostgreSQL Schema for Agent States and Experiences
-- ═══════════════════════════════════════════════════════════════

-- Agent states table
CREATE TABLE IF NOT EXISTS agent_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  energy DECIMAL(5,2) DEFAULT 100.00,
  rewards DECIMAL(10,2) DEFAULT 0.00,
  coherence DECIMAL(5,2) DEFAULT 85.00,
  entanglements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent experiences table
CREATE TABLE IF NOT EXISTS agent_experiences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id VARCHAR(50) NOT NULL,
  action JSONB NOT NULL,
  reward DECIMAL(10,2) NOT NULL,
  state_before JSONB,
  state_after JSONB,
  context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (agent_id) REFERENCES agent_states(agent_id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_experiences_agent_id ON agent_experiences(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_experiences_created_at ON agent_experiences(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_states_updated_at ON agent_states(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_experiences_reward ON agent_experiences(reward DESC);

-- Comments for documentation
COMMENT ON TABLE agent_states IS 'Stores current state of all AI agents in the quantum reward system';
COMMENT ON TABLE agent_experiences IS 'Stores historical experiences and rewards for reinforcement learning';

COMMENT ON COLUMN agent_states.agent_id IS 'Unique identifier for the agent (luna, karim, etc.)';
COMMENT ON COLUMN agent_states.energy IS 'Agent energy level (0-100), affects performance';
COMMENT ON COLUMN agent_states.rewards IS 'Total accumulated rewards for the agent';
COMMENT ON COLUMN agent_states.coherence IS 'Quantum coherence level (0-100), affects collaboration';
COMMENT ON COLUMN agent_states.entanglements IS 'JSON array of quantum entanglements with other agents';

COMMENT ON COLUMN agent_experiences.action IS 'JSON object describing the action taken';
COMMENT ON COLUMN agent_experiences.reward IS 'Reward value received for this action';
COMMENT ON COLUMN agent_experiences.state_before IS 'Agent state before the action';
COMMENT ON COLUMN agent_experiences.state_after IS 'Agent state after the action';
COMMENT ON COLUMN agent_experiences.context IS 'Additional context about the interaction';

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on agent_states
DROP TRIGGER IF EXISTS update_agent_states_updated_at ON agent_states;
CREATE TRIGGER update_agent_states_updated_at
    BEFORE UPDATE ON agent_states
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default agent states
INSERT INTO agent_states (agent_id, name, role, energy, rewards, coherence, entanglements)
VALUES 
  ('luna', 'Luna - Trip Architect', 'TRIP_PLANNING', 100.00, 0.00, 85.00, '[]'::jsonb),
  ('karim', 'Karim - Budget Optimizer', 'BUDGET_ANALYSIS', 100.00, 0.00, 90.00, '[]'::jsonb),
  ('layla', 'Layla - Cultural Guide', 'CULTURAL_INSIGHTS', 100.00, 0.00, 88.00, '[]'::jsonb),
  ('amira', 'Amira - Problem Solver', 'SAFETY_SECURITY', 100.00, 0.00, 92.00, '[]'::jsonb),
  ('tariq', 'Tariq - Payment Manager', 'PAYMENT_MANAGEMENT', 100.00, 0.00, 95.00, '[]'::jsonb),
  ('zara', 'Zara - Research Specialist', 'RESEARCH_ANALYSIS', 100.00, 0.00, 93.00, '[]'::jsonb),
  ('kody', 'Kody - Code Interpreter', 'DATA_PROCESSING', 100.00, 0.00, 89.00, '[]'::jsonb),
  ('scout', 'Scout - Proactive Monitor', 'MONITORING_ALERTS', 100.00, 0.00, 87.00, '[]'::jsonb)
ON CONFLICT (agent_id) DO NOTHING;

-- View for agent performance metrics
CREATE OR REPLACE VIEW agent_performance_metrics AS
SELECT 
  a.agent_id,
  a.name,
  a.role,
  a.energy,
  a.rewards,
  a.coherence,
  COUNT(e.id) as total_experiences,
  AVG(e.reward) as avg_reward,
  MAX(e.reward) as max_reward,
  MIN(e.reward) as min_reward,
  SUM(CASE WHEN e.reward > 0 THEN 1 ELSE 0 END) as positive_experiences,
  SUM(CASE WHEN e.reward < 0 THEN 1 ELSE 0 END) as negative_experiences,
  a.updated_at as last_updated
FROM agent_states a
LEFT JOIN agent_experiences e ON a.agent_id = e.agent_id
GROUP BY a.agent_id, a.name, a.role, a.energy, a.rewards, a.coherence, a.updated_at;

COMMENT ON VIEW agent_performance_metrics IS 'Aggregated performance metrics for all agents';

-- View for recent agent activity
CREATE OR REPLACE VIEW recent_agent_activity AS
SELECT 
  e.agent_id,
  a.name,
  e.action,
  e.reward,
  e.context,
  e.created_at
FROM agent_experiences e
JOIN agent_states a ON e.agent_id = a.agent_id
ORDER BY e.created_at DESC
LIMIT 100;

COMMENT ON VIEW recent_agent_activity IS 'Most recent 100 agent experiences';

-- Function to get agent leaderboard
CREATE OR REPLACE FUNCTION get_agent_leaderboard()
RETURNS TABLE (
  rank INTEGER,
  agent_id VARCHAR(50),
  name VARCHAR(100),
  total_rewards DECIMAL(10,2),
  energy DECIMAL(5,2),
  coherence DECIMAL(5,2),
  experience_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY a.rewards DESC)::INTEGER as rank,
    a.agent_id,
    a.name,
    a.rewards as total_rewards,
    a.energy,
    a.coherence,
    COUNT(e.id) as experience_count
  FROM agent_states a
  LEFT JOIN agent_experiences e ON a.agent_id = e.agent_id
  GROUP BY a.agent_id, a.name, a.rewards, a.energy, a.coherence
  ORDER BY a.rewards DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_agent_leaderboard IS 'Returns ranked list of agents by total rewards';

-- Function to calculate quantum entanglement network
CREATE OR REPLACE FUNCTION get_entanglement_network()
RETURNS TABLE (
  agent_id VARCHAR(50),
  name VARCHAR(100),
  entangled_with VARCHAR(50),
  strength DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.agent_id,
    a.name,
    (jsonb_array_elements(a.entanglements)->>'targetAgent')::VARCHAR(50) as entangled_with,
    ((jsonb_array_elements(a.entanglements)->>'strength')::DECIMAL(5,2)) as strength
  FROM agent_states a
  WHERE jsonb_array_length(a.entanglements) > 0;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_entanglement_network IS 'Returns network of quantum entanglements between agents';

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE ON agent_states TO authenticated;
-- GRANT SELECT, INSERT ON agent_experiences TO authenticated;
-- GRANT SELECT ON agent_performance_metrics TO authenticated;
-- GRANT SELECT ON recent_agent_activity TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_agent_leaderboard TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_entanglement_network TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Quantum Reward Engine schema created successfully!';
  RAISE NOTICE '📊 Created tables: agent_states, agent_experiences';
  RAISE NOTICE '📈 Created views: agent_performance_metrics, recent_agent_activity';
  RAISE NOTICE '🔧 Created functions: get_agent_leaderboard, get_entanglement_network';
  RAISE NOTICE '🌌 Initialized 8 default agents';
END $$;
