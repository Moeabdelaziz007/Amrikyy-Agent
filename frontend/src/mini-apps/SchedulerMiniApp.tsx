/**
 * Scheduler Mini App - Calendar Management
 * Calendar API integration for events
 *
 * @author Ona AI
 * @created 2025-10-23
 */

import React from 'react';
import { SchedulerAgentUI } from '@/components/agents/SchedulerAgentUI';

export function SchedulerMiniApp() {
  return (
    <div className="h-full w-full">
      <SchedulerAgentUI />
    </div>
  );
}

export default SchedulerMiniApp;
