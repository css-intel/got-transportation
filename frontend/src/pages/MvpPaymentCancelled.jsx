import { Link } from 'react-router-dom';

export default function MvpPaymentCancelled() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20">
      <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-10 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Payment Cancelled</h1>
        <p className="text-gray-600 mb-8">
          The MVP approval payment was not completed. The admin dashboard remains in demo mode.
          You can retry the payment at any time.
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
