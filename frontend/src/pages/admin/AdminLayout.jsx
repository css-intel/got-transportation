import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useMvp } from '../../context/MvpContext';
import DemoWatermark from '../../components/DemoWatermark';

export default function AdminLayout() {
  const { mvpPaid } = useMvp();
  const location = useLocation();

  const tabs = [
    { name: 'Overview', path: '/admin' },
    { name: 'Bookings', path: '/admin/bookings' },
    { name: 'Customers', path: '/admin/customers' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative">
      {!mvpPaid && <DemoWatermark />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            {!mvpPaid && (
              <p className="text-red-500 text-sm mt-1 font-medium">
                ⚠ Demo Version – Awaiting Approval Payment
              </p>
            )}
          </div>
          {!mvpPaid && (
            <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full">
              READ-ONLY DEMO
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm border border-slate-200 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                location.pathname === tab.path
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.name}
            </Link>
          ))}
        </div>

        <Outlet />
      </div>
    </div>
  );
}
