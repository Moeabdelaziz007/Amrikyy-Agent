/**
 * Vision Mini App - Image Analysis
 * Gemini Vision API for image understanding
 *
 * @author Ona AI
 * @created 2025-10-23
 */

import React from 'react';
import { VisionAgentUI } from '@/components/agents/VisionAgentUI';

export function VisionMiniApp() {
  return (
    <div className="h-full w-full">
      <VisionAgentUI />
    </div>
  );
}

export default VisionMiniApp;
