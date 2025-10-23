/**
 * Navigator Mini App - Location Intelligence
 * Google Maps integration for directions and places
 *
 * @author Ona AI
 * @created 2025-10-23
 */

import React from 'react';
import { NavigatorAgentUI } from '@/components/agents/NavigatorAgentUI';

export function NavigatorMiniApp() {
  return (
    <div className="h-full w-full">
      <NavigatorAgentUI />
    </div>
  );
}

export default NavigatorMiniApp;
