import { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'

const TYPES = ['money', 'food', 'clothes', 'medicine', 'other']
const STATUSES = ['pending', 'received', 'distributed']

export default function Donations() {
  const { user } = useAuth()
  const [donations, setDonations] = useState([])
  const [form, setForm] = useState({ amount: '', type: 'money', description: '' })
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = () => api.get('/donations').then(r => setDonations(r.data))
  useEffect(() => { load() }, [])

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/donations', form)
      setForm({ amount: '', type: 'money', description: '' })
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit donation')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    await api.put(`/donations/${id}/status`, { status })
    load()
  }

  const totalMoney = donations
    .filter(d => d.type === 'money')
    .reduce((sum, d) => sum + Number(d.amount), 0)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Donations</h1>
          <p className="text-sm text-gray-500 mt-1">
            {user.role === 'donor' ? 'Your donation history' : 'All donations received'}
          </p>
        </div>
        {user.role === 'donor' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800"
          >
            {showForm ? '✕ Cancel' : '+ New Donation'}
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total Donations</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{donations.length}</p>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total Money</p>
          <p className="text-2xl font-bold text-green-700 mt-1">₹{totalMoney.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <p className="text-xs text-gray-500">Distributed</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {donations.filter(d => d.status === 'distributed').length}
          </p>
        </div>
      </div>

      {/* Donation Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-5 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">New Donation</h2>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Amount (₹)</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                  placeholder="e.g. 500"
                  type="number"
                  min="1"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Type</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                >
                  {TYPES.map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
              placeholder="Description (optional)"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={2}
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-green-700 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-800 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Donation'}
            </button>
          </form>
        </div>
      )}

      {/* Donations Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {donations.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <p className="text-4xl mb-2">💰</p>
            <p className="text-sm">No donations yet</p>
            {user.role === 'donor' && (
              <button onClick={() => setShowForm(true)} className="mt-3 text-green-700 text-sm underline">
                Make your first donation
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                {['Donor', 'Amount', 'Type', 'Description', 'Status', 'Date',
                  ...(user.role === 'admin' ? ['Action'] : [])
                ].map(h => (
                  <th key={h} className="px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {donations.map(d => (
                <tr key={d.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">{d.donor_name || user.name}</td>
                  <td className="px-4 py-3 font-semibold text-green-700">
                    {d.type === 'money' ? `₹${Number(d.amount).toLocaleString()}` : `${d.amount} units`}
                  </td>
                  <td className="px-4 py-3 capitalize">{d.type}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{d.description || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge value={d.status} /></td>
                  <td className="px-4 py-3 text-gray-400">{new Date(d.created_at).toLocaleDateString()}</td>
                  {user.role === 'admin' && (
                    <td className="px-4 py-3">
                      <select
                        className="border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-300"
                        value={d.status}
                        onChange={e => updateStatus(d.id, e.target.value)}
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
