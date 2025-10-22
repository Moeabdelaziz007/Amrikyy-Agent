import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { CustomerModalProps, CustomerFormData, CustomerFormStep } from '../../../types/aiDesktop';
import CustomerModalTabs from './CustomerModalTabs';
import OverviewForm from './OverviewForm';
import AddressForm from './AddressForm';
import NotesForm from './NotesForm';
import { mockCustomerForm } from '../../../data/aiDesktopMockData';

/**
 * CustomerModal - Multi-step customer management modal
 * Features:
 * - Three-step workflow: Overview → Address → Notes
 * - Tab navigation with active state
 * - Form validation
 * - Save as Draft / Save and Next actions
 * - Glassmorphic design
 */
const CustomerModal = ({ isOpen, onClose, onSave, initialStep = 'overview' }: CustomerModalProps) => {
  const [currentStep, setCurrentStep] = useState<CustomerFormStep>(initialStep as CustomerFormStep);
  const [formData, setFormData] = useState<CustomerFormData>(mockCustomerForm);

  const tagColors: Record<CustomerFormStep, string> = {
    overview: '#cabdff',
    address: '#a9e195',
    notes: '#ff9d8f',
  };

  const sectionTitles: Record<CustomerFormStep, string> = {
    overview: 'Customer Overview',
    address: 'Address',
    notes: 'Notes',
  };

  const handleNext = () => {
    if (currentStep === 'overview') {
      setCurrentStep('address' as CustomerFormStep);
    } else if (currentStep === 'address') {
      setCurrentStep('notes' as CustomerFormStep);
    } else {
      onSave(formData);
      onClose();
    }
  };

  const handleSaveDraft = () => {
    console.log('Saving draft:', formData);
    onClose();
  };

  const isFormValid = () => {
    if (currentStep === 'overview') {
      return formData.overview.firstName && formData.overview.lastName;
    }
    if (currentStep === 'address') {
      return formData.address.country && formData.address.city && formData.address.zipCode;
    }
    return true;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-6 rounded"
                      style={{ background: tagColors[currentStep] }}
                    />
                    <h2 className="text-2xl font-bold text-[#3f434a]">
                      {sectionTitles[currentStep]}
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} color="#696f8c" />
                  </button>
                </div>

                {/* Tabs */}
                <CustomerModalTabs
                  currentStep={currentStep}
                  onStepChange={setCurrentStep}
                />
              </div>

              {/* Form Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {currentStep === 'overview' && (
                      <OverviewForm
                        data={formData.overview}
                        onChange={(overview) => setFormData({ ...formData, overview })}
                      />
                    )}
                    {currentStep === 'address' && (
                      <AddressForm
                        data={formData.address}
                        onChange={(address) => setFormData({ ...formData, address })}
                      />
                    )}
                    {currentStep === 'notes' && (
                      <NotesForm
                        data={formData.notes}
                        onChange={(notes) => setFormData({ ...formData, notes })}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={handleSaveDraft}
                  className="px-6 py-2.5 text-[#0b1234] font-medium text-base hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Save as Draft
                </button>
                <button
                  onClick={handleNext}
                  disabled={!isFormValid()}
                  className="px-6 py-2.5 bg-[#0f62fe] text-white font-medium text-base rounded-lg hover:bg-[#0353e9] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {currentStep === 'notes' ? 'Done' : 'Save and Next'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CustomerModal;