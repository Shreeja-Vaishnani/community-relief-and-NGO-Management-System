import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const StatCard = ({ label, value, color }) => (
  <div className={`${color} rounded-xl p-5 text-white`}>
    <p className="text-sm opacity-80">{label}</p>
    <p className="text-3xl font-bold mt-1">{value}</p>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user.role === 'admin') {
      api.get('/admin/stats').then(r => setStats(r.data));
    }
  }, [user]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {user.name} 👋</h1>
      <p className="text-gray-500 mb-6 capitalize">Role: {user.role}</p>

      {user.role === 'admin' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Users" value={stats.users} color="bg-blue-500" />
          <StatCard label="Money Donated (₹)" value={`₹${Number(stats.donations).toLocaleString()}`} color="bg-green-500" />
          <StatCard label="Pending Requests" value={stats.pendingRequests} color="bg-orange-500" />
          <StatCard label="Open Tasks" value={stats.openTasks} color="bg-purple-500" />
        </div>
      )}

      <div className="bg-white rounded-xl p-5 shadow-sm border">
        <h2 className="font-semibold text-gray-700 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {user.role === 'donor' && <a href="/donations" className="bg-green-50 border border-green-200 rounded-lg p-3 text-center hover:bg-green-100">💰 Make Donation</a>}
          {user.role === 'beneficiary' && <a href="/requests" className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center hover:bg-orange-100">📋 Submit Request</a>}
          {user.role === 'volunteer' && <a href="/tasks" className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center hover:bg-purple-100">✅ View My Tasks</a>}
          {user.role === 'admin' && <>
            <a href="/users" className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center hover:bg-blue-100">👥 Manage Users</a>
            <a href="/requests" className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center hover:bg-orange-100">📋 Review Requests</a>
            <a href="/tasks" className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center hover:bg-purple-100">📌 Assign Tasks</a>
            <a href="/donations" className="bg-green-50 border border-green-200 rounded-lg p-3 text-center hover:bg-green-100">💰 View Donations</a>
          </>}
        </div>
      </div>
    </div>
  );
}
