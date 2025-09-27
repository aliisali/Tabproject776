import React, { useState } from 'react';
import { FileText, Send, ArrowRight, DollarSign } from 'lucide-react';
import { Job } from '../../types';

interface QuotationScreenProps {
  job: Job;
  onComplete: (data: { quotation: number; quotationSent: boolean }) => void;
}

export function QuotationScreen({ job, onComplete }: QuotationScreenProps) {
  const [quotationAmount, setQuotationAmount] = useState(job.quotation || 0);
  const [quotationSent, setQuotationSent] = useState(false);
  const [customerApproved, setCustomerApproved] = useState(false);

  const calculateTotal = () => {
    const productsTotal = (job.selectedProducts || []).reduce((total, product) => 
      total + (product.price * product.quantity), 0
    );
    
    const measurementsCount = (job.measurements || []).length;
    const installationCost = measurementsCount * 50; // £50 per window
    
    return productsTotal + installationCost;
  };

  const handleSendQuotation = async () => {
    try {
      // Send quotation email to customer
      console.log('📧 Sending quotation email to customer');
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setQuotationSent(true);
      
      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successDiv.textContent = 'Quotation sent to customer successfully!';
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        if (document.body.contains(successDiv)) {
          document.body.removeChild(successDiv);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error sending quotation:', error);
      alert('Failed to send quotation. Please try again.');
    }
  };

  const handleLockInQuotation = () => {
    setCustomerApproved(true);
    onComplete({ 
      quotation: quotationAmount, 
      quotationSent: true 
    });
  };

  const handleTBD = () => {
    onComplete({ 
      quotation: quotationAmount, 
      quotationSent: true 
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Quotation</h3>
        <p className="text-gray-600">Prepare and send quotation to customer</p>
      </div>

      {/* Quotation Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Quotation Breakdown</h4>
        
        {/* Products */}
        <div className="space-y-3 mb-4">
          <h5 className="text-sm font-medium text-gray-700">Selected Products</h5>
          {(job.selectedProducts || []).map(product => (
            <div key={product.id} className="flex justify-between items-center">
              <span className="text-gray-900">{product.productName} × {product.quantity}</span>
              <span className="font-medium">${(product.price * product.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Installation Cost */}
        <div className="space-y-3 mb-4 pt-4 border-t border-gray-200">
          <h5 className="text-sm font-medium text-gray-700">Installation</h5>
          <div className="flex justify-between items-center">
            <span className="text-gray-900">{(job.measurements || []).length} windows × $50</span>
            <span className="font-medium">${((job.measurements || []).length * 50).toFixed(2)}</span>
          </div>
        </div>

        {/* Total */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Amount</span>
            <span className="text-blue-600">${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Quotation Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-blue-900">Send Quotation to Customer</h4>
          {quotationSent && (
            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
              ✓ Sent
            </span>
          )}
        </div>

        {!quotationSent ? (
          <button
            onClick={handleSendQuotation}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Quotation Email
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-blue-800 text-sm">
              Quotation has been sent to the customer. What is the customer's decision?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleLockInQuotation}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Customer Approved - Lock In
              </button>
              <button
                onClick={handleTBD}
                className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <FileText className="w-4 h-4 mr-2" />
                TBD - Customer Deciding
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Continue Button */}
      {quotationSent && (
        <div className="flex justify-end">
          <button
            onClick={() => onComplete({ quotation: calculateTotal(), quotationSent: true })}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue to Payment
            <ArrowRight className="w-4 h-4 ml-2 inline" />
          </button>
        </div>
      )}
    </div>
  );
}