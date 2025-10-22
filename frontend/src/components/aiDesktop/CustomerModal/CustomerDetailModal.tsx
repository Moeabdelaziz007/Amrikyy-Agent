import React from 'react';

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    lastInteraction: string;
    totalBookings: number;
  } | null;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-lg shadow-2xl border border-blue-500/50 w-full max-w-md mx-4 animate-fade-in">
        <h2 className="text-3xl font-bold text-white mb-6 border-b border-blue-400 pb-3">
          Customer Details
        </h2>
        <div className="space-y-4 text-gray-300">
          <p>
            <strong className="text-blue-300">Name:</strong> {customer.name}
          </p>
          <p>
            <strong className="text-blue-300">Email:</strong> {customer.email}
          </p>
          <p>
            <strong className="text-blue-300">Phone:</strong> {customer.phone}
          </p>
          <p>
            <strong className="text-blue-300">Address:</strong>{' '}
            {customer.address}
          </p>
          <p>
            <strong className="text-blue-300">Last Interaction:</strong>
            {customer.lastInteraction}
          </p>
          <p>
            <strong className="text-blue-300">Total Bookings:</strong>
            {customer.totalBookings}
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CustomerDetailModal;
