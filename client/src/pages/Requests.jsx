import { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'

const CATEGORIES = ['food', 'shelter', 'medical', 'education', 'clothing', 'other']
const URGENCIES = ['low', 'medium', 'high', 'critical']
const STATUSES = ['pending', 'approved', 'in_progress', 'fulfilled', 'rejected']

const URGENCY_ICON = { low: '🟢', medium: '🟡', high: '🟠', critical: '🔴' }

export default function Requests() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({ title: '', description: '', category: 'food', urgency: 'medium' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = () => api.get('/requests').then(r => setRequests(r.data))

  useEffect(() => { load() }, [])

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/requests', form)
      setForm({ title: '', description: '', category: 'food', urgency: 'medium' })
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    await api.put(`/requests/${id}/status`, { status })
    load()
  }

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = requests.filter(r => r.status === s).length
    return acc
  }, {})

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Relief Requests</h1>
          <p className="text-sm text-gray-500 mt-1">
            {user.role === 'beneficiary' ? 'Submit and track your relief requests' : 'Review and manage all relief requests'}
          </p>
        </div>
        {user.role === 'beneficiary' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800 flex items-center gap-2"
          >
            {showForm ? '✕ Cancel' : '+ New Request'}
          </button>
        )}
      </div>

      {/* Admin Stats Bar */}
      {user.role === 'admin' && (
        <div className="grid grid-cols-5 gap-3 mb-6">
          {STATUSES.map(s => (
            <div key={s} className="bg-white rounded-lg p-3 shadow-sm border text-center">
              <p className="text-xl font-bold text-gray-800">{counts[s] || 0}</p>
              <p className="text-xs text-gray-500 capitalize mt-1">{s.replace('_', ' ')}</p>
            </div>
          ))}
        </div>
      )}

      {/* Submit Form (Beneficiary) */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-5 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Submit New Request</h2>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <form onSubmit={submit} className="space-y-3">
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
              placeholder="Request title (e.g. Need food supplies for family)"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Category</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Urgency</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                  value={form.urgency}
                  onChange={e => setForm({ ...form, urgency: e.target.value })}
                >
                  {URGENCIES.map(u => (
                    <option key={u} value={u}>{URGENCY_ICON[u]} {u.charAt(0).toUpperCase() + u.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
              placeholder="Describe your situation and what you need..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-green-700 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-800 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', ...STATUSES].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
              filter === s
                ? 'bg-green-700 text-white'
                : 'bg-white border text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s.replace('_', ' ')} {s !== 'all' && `(${counts[s] || 0})`}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border p-10 text-center text-gray-400">
          <p className="text-4xl mb-2">📋</p>
          <p className="text-sm">No requests found</p>
          {user.role === 'beneficiary' && (
            <button onClick={() => setShowForm(true)} className="mt-3 text-green-700 text-sm underline">
              Submit your first request
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm">{URGENCY_ICON[r.urgency]}</span>
                    <h3 className="font-semibold text-gray-800">{r.title}</h3>
                    <StatusBadge value={r.urgency} />
                    <StatusBadge value={r.status} />
                  </div>
                  {user.role === 'admin' && (
                    <p className="text-xs text-gray-500 mb-1">👤 {r.beneficiary_name}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">{r.description}</p>
                  <div className="flex gap-3 mt-2 text-xs text-gray-400">
                    <span className="capitalize">📁 {r.category}</span>
                    <span>🗓 {new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Admin Status Control */}
                {user.role === 'admin' && (
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    <label className="text-xs text-gray-500">Update Status</label>
                    <select
                      className="border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-300"
                      value={r.status}
                      onChange={e => updateStatus(r.id, e.target.value)}
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
