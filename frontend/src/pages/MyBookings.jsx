import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/bookings/my')
      .then((data) => setBookings(data.bookings))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">My Rides</h1>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
          <p className="text-gray-400 text-lg">No rides booked yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[booking.status]}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                  <span className="ml-2 text-xs text-gray-400">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="font-bold text-xl text-blue-600">${parseFloat(booking.fare).toFixed(2)}</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Pickup</p>
                  <p className="text-slate-700 font-medium">{booking.pickupAddress}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Dropoff</p>
                  <p className="text-slate-700 font-medium">{booking.dropoffAddress}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span>{booking.serviceType === 'medical_courier' ? '🏥 Medical Courier' : '🚗 Personal'}</span>
                <span>{booking.distanceMiles} miles</span>
                <span>{booking.isAsap ? 'ASAP' : new Date(booking.scheduledAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
