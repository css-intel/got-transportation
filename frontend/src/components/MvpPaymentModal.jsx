import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useMvp } from '../context/MvpContext';

export default function MvpPaymentModal() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { mvpPaid } = useMvp();

  useEffect(() => {
    if (mvpPaid) return;

    const timer = setTimeout(() => {
      setShow(true);
    }, 120000); // 2 minutes = 120 seconds

    return () => clearTimeout(timer);
  }, [mvpPaid]);

  if (mvpPaid || !show) return null;

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.post('/api/payments/mvp-checkout');
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 p-8 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">G</span>
          </div>
          <h2 className="text-white text-2xl font-bold">Continue Project Development</h2>
        </div>

        {/* Body */}
        <div className="p-8">
          <p className="text-gray-600 text-center mb-6">
            You are reviewing the MVP for<br />
            <strong className="text-slate-900">Nita Jr. Get On Through (G.O.T) Transportation</strong>
          </p>

          <p className="text-gray-600 text-center mb-8">
            To move forward with full development and deployment, please complete the MVP approval payment.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6 text-center">
            <p className="text-sm text-blue-600 font-medium mb-1">MVP Development Fee</p>
            <p className="text-4xl font-bold text-slate-900">$2,500</p>
            <p className="text-sm text-gray-500 mt-2">50% deposit required: <strong className="text-slate-800">$1,250</strong></p>
          </div>

          <p className="text-center text-gray-500 text-sm mb-6">
            Click below to approve and continue.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 px-6 rounded-xl transition-all text-lg shadow-lg shadow-blue-600/30"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Approve & Pay Now'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
