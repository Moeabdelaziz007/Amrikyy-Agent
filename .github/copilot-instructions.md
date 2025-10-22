## Copilot instructions for Amrikyy-Agent

These short, actionable rules help AI coding agents be immediately productive in this repository.

1. Big picture
   - Monorepo: `frontend/` (React + Vite + TypeScript) and `backend/` (Node.js + Express). Backend contains `src/agents/`, `src/mcp/`, `src/services/`, `routes/`, and `middleware/`.
   - AI-first: multiple agents (QuantumGeminiCore, Karim, Luna, Scout) and MCP servers coordinate external tools. See `AGENTS.md` and `backend/src/agents/`.

2. What to change where
   - Routes only orchestrate HTTP. Move business logic to `controllers/` → `services/`. Agents own AI logic. (See `.cursorrules` examples.)
   - Frontend: UI in `frontend/src/components/`, hooks and services hold logic (`hooks/*`, `api/services/*`). Use TypeScript and shadcn/ui conventions.

3. Key commands & workflows (run these when editing or testing)
   - Backend dev: `cd backend && npm install && npm run dev` (nodemon)
   - Frontend dev: `cd frontend && npm install && npm run dev` (Vite on :5173)
   - Run agents: `cd backend && npm run quantum-agent` (tests for Gemini integrations)
   - Tests: `cd backend && npm test`; frontend tests under `frontend/`.

4. Environment and integrations
   - Required env vars: see `AGENTS.md` and `README.md` (GEMINI_API_KEY, SUPABASE_*, JWT_SECRET). Copy `.env.example` where present.
   - Redis fallback to in-memory cache; check `backend/src/cache/RedisCache` for TTLs and usage examples.
   - MCP servers are managed via `src/services/MCPServerManager.js`.

5. Patterns and anti-patterns (copyable checks)
   - Good: `routes/*` call `controllers/*`, controllers call `services/*`, services call `db` or MCP tools. Example: `routes/trips.js` → `controllers/tripController.js` → `services/tripService.js`.
   - Bad: business logic directly in `routes/*` or API calls inside React components. Move to `hooks/` or `api/services/`.

6. Tests & quality
   - Backend: aim to keep unit and integration tests under `backend/tests/`. Run `npm run test:coverage` before merging.
   - Type checking: `cd backend && npm run typecheck` (use before large PRs).

7. What to look for in PRs
   - No secrets in code; ensure `.env` usage.
   - Agents changes include LangSmith tracing and updates to MCP tool signatures.
   - New frontend components must include TypeScript interfaces and use custom hooks for logic.

8. Files to consult for decisions
   - `AGENTS.md`, `README.md`, `.cursorrules`, `AMRIKYY_AI_OS_PLAN.md`, and `backend/src/services/MCPServerManager.js`.

If anything above is unclear or you need examples for a specific area (agents, MCP tools, caching, or frontend patterns), ask and I'll expand the instructions.
