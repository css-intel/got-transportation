import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/revenue')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) return <p className="text-gray-500">Failed to load stats.</p>;

  const cards = [
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, color: 'bg-green-600' },
    { label: "Today's Revenue", value: `$${stats.todayRevenue.toFixed(2)}`, color: 'bg-blue-600' },
    { label: 'Total Bookings', value: stats.totalBookings, color: 'bg-slate-700' },
    { label: 'Customers', value: stats.totalCustomers, color: 'bg-purple-600' },
  ];

  const statusCards = [
    { label: 'Pending', value: stats.pendingBookings, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    { label: 'Confirmed', value: stats.confirmedBookings, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: 'Completed', value: stats.completedBookings, color: 'text-green-600 bg-green-50 border-green-200' },
    { label: 'Cancelled', value: stats.cancelledBookings, color: 'text-red-600 bg-red-50 border-red-200' },
  ];

  return (
    <div>
      {/* Revenue Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-gray-500 mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            <div className={`w-12 h-1 ${card.color} rounded mt-3`}></div>
          </div>
        ))}
      </div>

      {/* Status Breakdown */}
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Booking Status Breakdown</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statusCards.map((card) => (
          <div key={card.label} className={`rounded-xl border p-5 ${card.color}`}>
            <p className="text-sm font-medium mb-1">{card.label}</p>
            <p className="text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
