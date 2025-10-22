import { motion } from 'framer-motion';
import type { CustomerFormStep } from '../../../types/aiDesktop';

interface CustomerModalTabsProps {
  currentStep: CustomerFormStep;
  onStepChange: (step: CustomerFormStep) => void;
}

/**
 * CustomerModalTabs - Tab navigation for customer modal
 * Features:
 * - Three tabs: Overview, Address, Notes
 * - Active state with blue underline
 * - Click to navigate between steps
 */
const CustomerModalTabs = ({ currentStep, onStepChange }: CustomerModalTabsProps) => {
  const tabs: { id: CustomerFormStep; label: string }[] = [
    { id: 'overview' as CustomerFormStep, label: 'Overview' },
    { id: 'address' as CustomerFormStep, label: 'Address' },
    { id: 'notes' as CustomerFormStep, label: 'Notes' },
  ];

  return (
    <div className="flex items-center gap-8 border-b border-gray-700">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onStepChange(tab.id)}
          className="relative pb-4 text-sm font-medium transition-colors"
          style={{
            color: currentStep === tab.id ? '#0f62fe' : '#696f8c',
          }}
        >
          {tab.label}
          
          {/* Active Indicator */}
          {currentStep === tab.id && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0f62fe]"
              layoutId="activeTab"
              transition={{ duration: 0.3 }}
            />
          )}
        </button>
      ))}
    </div>
  );
};

export default CustomerModalTabs;