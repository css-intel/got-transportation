import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useMvp } from '../context/MvpContext';

export default function MvpPaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const { setMvpPaid } = useMvp();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      api.get(`/api/payments/mvp-verify/${sessionId}`)
        .then((data) => {
          setVerified(data.paid);
          if (data.paid) setMvpPaid(true);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [searchParams, setMvpPaid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-20">
      <div className="bg-white rounded-2xl shadow-lg border border-green-200 p-10 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          {verified ? 'Payment Confirmed!' : 'Processing Payment...'}
        </h1>
        <p className="text-gray-600 mb-8">
          {verified
            ? 'Thank you. Development will continue. Full admin functionality is now unlocked.'
            : 'Your payment is being verified. Please check back shortly.'}
        </p>
        <Link
          to="/admin"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition"
        >
          Go to Admin Dashboard
        </Link>
      </div>
    </div>
  );
}
