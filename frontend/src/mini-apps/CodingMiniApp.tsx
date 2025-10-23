/**
 * Coding Mini App - Super Coder with 6 Sub-Agents
 * Wrapper for CodingAgentUI
 *
 * @author Ona AI
 * @created 2025-10-23
 */

import React from 'react';
import { CodingAgentUI } from '@/components/agents/CodingAgentUI';

export function CodingMiniApp() {
  return (
    <div className="h-full w-full">
      <CodingAgentUI />
    </div>
  );
}

export default CodingMiniApp;
