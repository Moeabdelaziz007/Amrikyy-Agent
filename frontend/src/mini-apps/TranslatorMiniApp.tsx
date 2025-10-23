/**
 * Translator Mini App - Language Translation
 * Google Translate API integration
 *
 * @author Ona AI
 * @created 2025-10-23
 */

import React from 'react';
import { TranslatorAgentUI } from '@/components/agents/TranslatorAgentUI';

export function TranslatorMiniApp() {
  return (
    <div className="h-full w-full">
      <TranslatorAgentUI />
    </div>
  );
}

export default TranslatorMiniApp;
