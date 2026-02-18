import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useMvp } from '../../context/MvpContext';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const { mvpPaid } = useMvp();

  const fetchBookings = () => {
    const query = filter ? `?status=${filter}` : '';
    api.get(`/api/admin/bookings${query}`)
      .then((data) => setBookings(data.bookings))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const updateStatus = async (id, status) => {
    if (!mvpPaid) {
      alert('Demo mode: Cannot modify bookings until MVP payment is completed.');
      return;
    }
    try {
      await api.patch(`/api/admin/bookings/${id}/status`, { status });
      fetchBookings();
    } catch (err) {
      alert(err.message);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const filters = ['', 'pending', 'confirmed', 'completed', 'cancelled'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f ? f.charAt(0).toUpperCase() + f.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-gray-400">No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[booking.status]}`}>
                      {booking.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(booking.createdAt).toLocaleDateString()} {new Date(booking.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">
                    <strong>{booking.user?.name || 'Unknown'}</strong> ({booking.user?.email})
                  </p>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {booking.pickupAddress} → {booking.dropoffAddress}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>{booking.serviceType === 'medical_courier' ? '🏥 Medical' : '🚗 Personal'}</span>
                    <span>{booking.distanceMiles} mi</span>
                    <span className="font-bold text-blue-600 text-sm">${parseFloat(booking.fare).toFixed(2)}</span>
                  </div>
                </div>

                {/* Status Actions */}
                <div className="flex flex-wrap gap-2 sm:flex-col">
                  {['pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
                    s !== booking.status && (
                      <button
                        key={s}
                        onClick={() => updateStatus(booking.id, s)}
                        disabled={!mvpPaid}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                          !mvpPaid
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        → {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    )
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
