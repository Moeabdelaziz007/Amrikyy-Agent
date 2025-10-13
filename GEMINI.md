# Gemini Agent Instructions

This document provides instructions and context for the Gemini AI agent to effectively interact with the `maya-travel-agent` codebase.

## Project Overview

This is the `amrikyy-platform`, an AI-powered travel booking platform. Key features include crypto payments and enterprise-grade compliance. The project is a monorepo containing a `backend`, a `frontend`, and an `aix-auditor` for AI agent security.

## Tech Stack

- **Monorepo Management**: npm Workspaces
- **Backend**: Node.js, Express (likely, based on typical Node.js setups)
- **Frontend**: JavaScript/TypeScript, likely a modern framework like React or Vue.
- **Database**: Supabase (as indicated by `supabase-schema.sql`)
- **Deployment**: Vercel (`vercel.json`) and Railway (`railway.toml`)
- **Process Management**: PM2 (`ecosystem.config.js`)
- **CI/CD & Tooling**: GitHub Actions, Husky (for pre-commit hooks), Docker (`.gitpod.Dockerfile`)
- **Testing**: k6 (load testing), likely Jest or similar for unit/integration tests.
- **Monitoring**: Prometheus (`prometheus.yml`) and Grafana (`grafana/`)

## Directory Structure

- `backend/`: Contains the Node.js backend application.
- `frontend/`: Contains the frontend application.
- `aix-auditor/`: A dedicated tool for auditing and securing AIX (AI Exchange) agent configurations.
- `scripts/`: Contains various utility and automation scripts.
- `proto/`: Likely contains protobuf files for gRPC communication.
- `docs/`: Project documentation.
- `n8n-workflows/`: Contains n8n workflow automation files.

## Key Commands

The project uses npm workspaces. Commands should generally be run from the root directory.

- **Install All Dependencies**:
  ```bash
  npm run install:all
  ```

- **Run Development Servers (Backend & Frontend)**:
  ```bash
  npm run dev
  ```

- **Run Production Build**:
  ```bash
  npm run build
  ```

- **Start Production Servers**:
  ```bash
  npm run start
  ```

- **Run Tests**:
  ```bash
  npm run test
  ```

- **Run Linter**:
  ```bash
  npm run lint
  ```

- **Fix Linting Issues**:
  ```bash
  npm run lint:fix
  ```

- **Audit AIX Agents**:
  ```bash
  npm run aix-audit
  ```

## Agent Guidelines

- **Adhere to Conventions**: Follow the existing coding style, naming conventions, and architectural patterns found in the `backend` and `frontend` directories.
- **Use Existing Tooling**: Utilize the provided `npm` scripts for all standard tasks like testing, linting, and building.
- **Verify Changes**: Before committing, run the linter and tests to ensure your changes haven't introduced regressions. Husky pre-commit hooks are configured to enforce this.
- **AIX Security**: When modifying any files related to AI agents (e.g., `.aix.json` files), run the `aix-audit` script to check for security vulnerabilities.
