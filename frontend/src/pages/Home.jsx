import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
              <span className="text-blue-300 text-sm font-medium">Reliable Transportation Services</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
              Nita Jr.<br />
              <span className="text-blue-400">Get On Through</span><br />
              Transportation
            </h1>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Professional personal transportation and medical courier services. 
              Safe, reliable, and affordable rides when you need them.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/book"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl text-lg transition shadow-lg shadow-blue-600/30"
                >
                  Book a Ride Now
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl text-lg transition shadow-lg shadow-blue-600/30"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl text-lg transition border border-white/20"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Our Services</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Personal Transportation</h3>
              <p className="text-gray-600 mb-4">
                Comfortable, reliable rides for your daily needs. Airport transfers, appointments, errands — we've got you covered.
              </p>
              <p className="text-blue-600 font-semibold">Starting at $8 + $2.50/mi</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition">
              <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Medical Courier</h3>
              <p className="text-gray-600 mb-4">
                Secure, timely delivery of medical supplies, prescriptions, and lab specimens with professional handling.
              </p>
              <p className="text-green-600 font-semibold">Starting at $18 + $2.50/mi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Simple, transparent pricing</h2>
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
            <div className="bg-slate-900 p-6 text-center">
              <h3 className="text-white text-xl font-bold">Fare Breakdown</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-gray-600">Base Fare</span>
                <span className="font-bold text-slate-900">$8.00</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-gray-600">Per Mile</span>
                <span className="font-bold text-slate-900">$2.50</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600">Medical Courier Add-on</span>
                <span className="font-bold text-green-600">+$10.00 flat</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to ride?</h2>
          <p className="text-blue-100 text-lg mb-8">
            Sign up today and book your first ride in minutes.
          </p>
          {user ? (
            <Link
              to="/book"
              className="inline-block bg-white text-blue-600 font-semibold py-4 px-8 rounded-xl text-lg hover:bg-blue-50 transition shadow-lg"
            >
              Book Now
            </Link>
          ) : (
            <Link
              to="/register"
              className="inline-block bg-white text-blue-600 font-semibold py-4 px-8 rounded-xl text-lg hover:bg-blue-50 transition shadow-lg"
            >
              Create Account
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
