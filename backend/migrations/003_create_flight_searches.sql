-- Migration: 003_create_flight_searches
-- Description: Create flight_searches table for caching search results
-- Author: Ona AI Assistant
-- Date: 2025-10-21

-- Create flight_searches table
-- Caches flight search results to reduce API calls and improve performance
CREATE TABLE IF NOT EXISTS public.flight_searches (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Search parameters (stored as JSONB for flexible querying)
  search_params JSONB NOT NULL,
  
  -- Search results (stored as JSONB)
  results JSONB NOT NULL,
  
  -- Cache metadata
  result_count INTEGER DEFAULT 0,
  api_source TEXT DEFAULT 'kiwi',
  
  -- TTL (Time To Live)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '5 minutes')
);

-- Add comments for documentation
COMMENT ON TABLE public.flight_searches IS 'Cached flight search results to reduce API calls';
COMMENT ON COLUMN public.flight_searches.id IS 'Unique cache entry identifier';
COMMENT ON COLUMN public.flight_searches.search_params IS 'Search parameters (origin, destination, dates, etc.)';
COMMENT ON COLUMN public.flight_searches.results IS 'Flight search results from API';
COMMENT ON COLUMN public.flight_searches.result_count IS 'Number of results returned';
COMMENT ON COLUMN public.flight_searches.api_source IS 'API source (kiwi, amadeus, etc.)';
COMMENT ON COLUMN public.flight_searches.created_at IS 'When the search was cached';
COMMENT ON COLUMN public.flight_searches.expires_at IS 'When the cache expires (default: 5 minutes)';

-- Create GIN index for fast JSONB queries
CREATE INDEX IF NOT EXISTS idx_flight_searches_params 
  ON public.flight_searches USING GIN (search_params);

-- Create index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_flight_searches_expires 
  ON public.flight_searches(expires_at);

-- Create index on created_at
CREATE INDEX IF NOT EXISTS idx_flight_searches_created 
  ON public.flight_searches(created_at DESC);

-- Create function to delete expired searches
CREATE OR REPLACE FUNCTION delete_expired_flight_searches()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.flight_searches 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE NOTICE 'Deleted % expired flight search(es)', deleted_count;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION delete_expired_flight_searches() IS 'Deletes expired flight search cache entries';

-- Create function to get cached search results
CREATE OR REPLACE FUNCTION get_cached_flight_search(params JSONB)
RETURNS JSONB AS $$
DECLARE
  cached_result JSONB;
BEGIN
  SELECT results INTO cached_result
  FROM public.flight_searches
  WHERE search_params = params
    AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN cached_result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_cached_flight_search(JSONB) IS 'Retrieves cached flight search results if not expired';

-- Grant permissions
GRANT SELECT ON public.flight_searches TO authenticated;
GRANT SELECT ON public.flight_searches TO anon;
GRANT INSERT ON public.flight_searches TO authenticated;
GRANT INSERT ON public.flight_searches TO anon;
GRANT DELETE ON public.flight_searches TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration 003_create_flight_searches completed successfully';
  RAISE NOTICE 'Cache TTL set to 5 minutes by default';
  RAISE NOTICE 'Helper functions created for cache management';
END $$;
