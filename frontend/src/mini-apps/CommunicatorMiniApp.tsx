/**
 * Communicator Mini App - Email & SMS
 * Communication capabilities via email and SMS
 *
 * @author Ona AI
 * @created 2025-10-23
 */

import React from 'react';
import { CommunicatorAgentUI } from '@/components/agents/CommunicatorAgentUI';

export function CommunicatorMiniApp() {
  return (
    <div className="h-full w-full">
      <CommunicatorAgentUI />
    </div>
  );
}

export default CommunicatorMiniApp;
