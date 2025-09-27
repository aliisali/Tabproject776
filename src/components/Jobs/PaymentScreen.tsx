import React, { useState } from 'react';
import { CreditCard, Banknote, Building, ArrowRight, DollarSign } from 'lucide-react';
import { Job } from '../../types';

interface PaymentScreenProps {
  job: Job;
  onComplete: (data: { deposit?: number; depositPaid: boolean; paymentMethod: string; customerReference?: string }) => void;
}

export function PaymentScreen({ job, onComplete }: PaymentScreenProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'bank-transfer'>('card');
  const [depositAmount, setDepositAmount] = useState(job.quotation ? job.quotation * 0.3 : 0); // 30% deposit
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [customerReference] = useState(`REF-${Date.now().toString().slice(-6)}`);

  const handlePayment = async () => {
    setPaymentProcessing(true);
    
    try {
      if (paymentMethod === 'card') {
        // Simulate payment gateway processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        setPaymentComplete(true);
      } else {
        // For cash/bank transfer, mark as pending
        setPaymentComplete(true);
      }
      
      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successDiv.textContent = paymentMethod === 'card' 
        ? 'Payment processed successfully!' 
        : `${paymentMethod === 'cash' ? 'Cash' : 'Bank transfer'} payment recorded!`;
      document.body.appendChild(successDiv);
      
      setTimeout(() => {
        if (document.body.contains(successDiv)) {
          document.body.removeChild(successDiv);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    }
    
    setPaymentProcessing(false);
  };

  const handleComplete = () => {
    onComplete({
      deposit: depositAmount,
      depositPaid: paymentComplete,
      paymentMethod,
      customerReference
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {job.jobType === 'measurement' ? 'Deposit Payment' : 'Final Payment'}
        </h3>
        <p className="text-gray-600">
          {job.jobType === 'measurement' 
            ? 'Collect deposit to confirm the order'
            : 'Collect final payment for completed installation'
          }
        </p>
      </div>

      {/* Payment Amount */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-blue-900">Payment Details</h4>
          <div className="text-right">
            <p className="text-sm text-blue-700">
              {job.jobType === 'measurement' ? 'Deposit Amount (30%)' : 'Final Payment'}
            </p>
            <p className="text-2xl font-bold text-blue-900">${depositAmount.toFixed(2)}</p>
          </div>
        </div>
        
        {job.jobType === 'measurement' && (
          <div className="text-sm text-blue-800">
            <p>Total Job Value: ${job.quotation?.toFixed(2)}</p>
            <p>Remaining Balance: ${((job.quotation || 0) - depositAmount).toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* Payment Method Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Payment Method
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              paymentMethod === 'card'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <CreditCard className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Card Payment</p>
                <p className="text-sm text-gray-600">Pay now with card</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('cash')}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              paymentMethod === 'cash'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Banknote className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Cash Payment</p>
                <p className="text-sm text-gray-600">Pay with cash</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('bank-transfer')}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              paymentMethod === 'bank-transfer'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Building className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900">Bank Transfer</p>
                <p className="text-sm text-gray-600">Transfer to account</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Customer Reference */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">Customer Reference Number</h4>
        <p className="text-yellow-800 text-sm mb-2">
          Customer can use this reference to pay online: <strong>{customerReference}</strong>
        </p>
        <p className="text-yellow-700 text-xs">
          Share this reference number with the customer for online payment
        </p>
      </div>

      {/* Payment Processing */}
      {!paymentComplete ? (
        <div className="flex justify-center">
          <button
            onClick={handlePayment}
            disabled={paymentProcessing}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <DollarSign className="w-5 h-5 mr-2" />
            {paymentProcessing 
              ? 'Processing Payment...' 
              : `Process ${paymentMethod === 'card' ? 'Card' : paymentMethod === 'cash' ? 'Cash' : 'Bank Transfer'} Payment`
            }
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Payment Recorded</h4>
          <p className="text-gray-600 mb-4">
            {paymentMethod === 'card' 
              ? 'Payment processed successfully'
              : `${paymentMethod === 'cash' ? 'Cash' : 'Bank transfer'} payment recorded`
            }
          </p>
          
          <button
            onClick={handleComplete}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Complete {job.jobType === 'measurement' ? 'Measurement' : 'Installation'}
            <ArrowRight className="w-4 h-4 ml-2 inline" />
          </button>
        </div>
      )}
    </div>
  );
}