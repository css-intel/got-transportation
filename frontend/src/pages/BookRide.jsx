import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function BookRide() {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [serviceType, setServiceType] = useState('personal_transportation');
  const [scheduleType, setScheduleType] = useState('asap');
  const [scheduledAt, setScheduledAt] = useState('');
  const [distanceMiles, setDistanceMiles] = useState(null);
  const [fareEstimate, setFareEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);

  // Initialize Google Maps Autocomplete if available
  useEffect(() => {
    if (window.google?.maps?.places) {
      const pickupAuto = new window.google.maps.places.Autocomplete(pickupRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
      });
      pickupAuto.addListener('place_changed', () => {
        const place = pickupAuto.getPlace();
        setPickup(place.formatted_address || place.name);
      });

      const dropoffAuto = new window.google.maps.places.Autocomplete(dropoffRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
      });
      dropoffAuto.addListener('place_changed', () => {
        const place = dropoffAuto.getPlace();
        setDropoff(place.formatted_address || place.name);
      });
    }
  }, []);

  const getEstimate = async () => {
    if (!pickup || !dropoff) {
      setError('Please enter both pickup and dropoff addresses.');
      return;
    }

    setEstimating(true);
    setError('');

    try {
      // Get distance
      const distData = await api.post('/api/bookings/distance', {
        origin: pickup,
        destination: dropoff,
      });

      setDistanceMiles(distData.distanceMiles);

      // Get fare
      const fareData = await api.post('/api/bookings/estimate', {
        distanceMiles: distData.distanceMiles,
        serviceType,
      });

      setFareEstimate(fareData);
    } catch (err) {
      setError(err.message);
    } finally {
      setEstimating(false);
    }
  };

  // Recalculate when service type changes and we have distance
  useEffect(() => {
    if (distanceMiles) {
      api.post('/api/bookings/estimate', {
        distanceMiles,
        serviceType,
      }).then(setFareEstimate).catch(console.error);
    }
  }, [serviceType, distanceMiles]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!fareEstimate) {
      setError('Please get a fare estimate first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await api.post('/api/bookings', {
        pickupAddress: pickup,
        dropoffAddress: dropoff,
        serviceType,
        isAsap: scheduleType === 'asap',
        scheduledAt: scheduleType === 'scheduled' ? scheduledAt : null,
        distanceMiles,
      });

      setSuccess(data.booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-green-200 overflow-hidden">
          <div className="bg-green-600 p-8 text-center">
            <svg className="w-16 h-16 text-white mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="text-2xl font-bold text-white">Booking Confirmed!</h2>
          </div>
          <div className="p-8">
            <div className="space-y-3 mb-8">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-gray-500">Service</span>
                <span className="font-medium">{success.serviceType === 'medical_courier' ? 'Medical Courier' : 'Personal Transportation'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-gray-500">Pickup</span>
                <span className="font-medium text-right max-w-[60%]">{success.pickupAddress}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-gray-500">Dropoff</span>
                <span className="font-medium text-right max-w-[60%]">{success.dropoffAddress}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-gray-500">Distance</span>
                <span className="font-medium">{success.distanceMiles} mi</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Total Fare</span>
                <span className="font-bold text-xl text-blue-600">${parseFloat(success.fare).toFixed(2)}</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm text-center mb-6">
              A confirmation email has been sent. Your ride status is <strong>Pending</strong>.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/my-bookings')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
              >
                View My Rides
              </button>
              <button
                onClick={() => { setSuccess(null); setFareEstimate(null); setDistanceMiles(null); setPickup(''); setDropoff(''); }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition"
              >
                Book Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Book a Ride</h1>
        <p className="text-gray-500 mt-2">Enter your trip details for an instant quote</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Form */}
        <form onSubmit={handleBook} className="lg:col-span-3 bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Pickup Address</label>
            <input
              ref={pickupRef}
              type="text"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Enter pickup location"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Dropoff Address</label>
            <input
              ref={dropoffRef}
              type="text"
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Enter dropoff location"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Service Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setServiceType('personal_transportation')}
                className={`p-4 rounded-xl border-2 text-left transition ${
                  serviceType === 'personal_transportation'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="font-semibold text-slate-900 text-sm">Personal Transportation</p>
                <p className="text-xs text-gray-500 mt-1">Standard ride service</p>
              </button>
              <button
                type="button"
                onClick={() => setServiceType('medical_courier')}
                className={`p-4 rounded-xl border-2 text-left transition ${
                  serviceType === 'medical_courier'
                    ? 'border-green-600 bg-green-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <p className="font-semibold text-slate-900 text-sm">Medical Courier</p>
                <p className="text-xs text-gray-500 mt-1">+$10 flat surcharge</p>
              </button>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Schedule</label>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                type="button"
                onClick={() => setScheduleType('asap')}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition ${
                  scheduleType === 'asap'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                ASAP
              </button>
              <button
                type="button"
                onClick={() => setScheduleType('scheduled')}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition ${
                  scheduleType === 'scheduled'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Schedule
              </button>
            </div>
            {scheduleType === 'scheduled' && (
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            )}
          </div>

          <button
            type="button"
            onClick={getEstimate}
            disabled={estimating}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold py-3 rounded-xl transition mb-4"
          >
            {estimating ? 'Calculating...' : 'Get Fare Estimate'}
          </button>

          {fareEstimate && (
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition"
            >
              {loading ? 'Booking...' : `Book Now — $${fareEstimate.totalFare.toFixed(2)}`}
            </button>
          )}
        </form>

        {/* Fare Estimate Sidebar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Fare Estimate</h3>
            {fareEstimate ? (
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-gray-500 text-sm">Base Fare</span>
                  <span className="font-medium">${fareEstimate.baseFare.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-gray-500 text-sm">Distance ({distanceMiles} mi × $2.50)</span>
                  <span className="font-medium">${fareEstimate.mileageCost.toFixed(2)}</span>
                </div>
                {fareEstimate.medicalSurcharge > 0 && (
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-gray-500 text-sm">Medical Courier</span>
                    <span className="font-medium text-green-600">${fareEstimate.medicalSurcharge.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-3">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-bold text-2xl text-blue-600">${fareEstimate.totalFare.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">Enter addresses and click<br />"Get Fare Estimate"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
