import { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'

const STATUSES = ['open', 'assigned', 'in_progress', 'completed', 'cancelled']
const VOLUNTEER_STATUSES = ['in_progress', 'completed']

export default function Tasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [volunteers, setVolunteers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({ title: '', description: '', location: '', due_date: '', volunteer_id: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = () => api.get('/tasks').then(r => setTasks(r.data))

  useEffect(() => {
    load()
    if (user.role === 'admin') {
      api.get('/admin/users').then(r =>
        setVolunteers(r.data.filter(u => u.role === 'volunteer'))
      )
    }
  }, [user.role])

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/tasks', { ...form, volunteer_id: form.volunteer_id || null })
      setForm({ title: '', description: '', location: '', due_date: '', volunteer_id: '' })
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    await api.put(`/tasks/${id}/status`, { status })
    load()
  }

  const takeTask = async (id) => {
    await api.put(`/tasks/${id}/assign`)
    load()
  }

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s).length
    return acc
  }, {})

  const STATUS_ICON = { open: '🔵', assigned: '🟣', in_progress: '🟠', completed: '🟢', cancelled: '🔴' }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Volunteer Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">
            {user.role === 'volunteer' ? 'Your assigned tasks' : 'Create and manage volunteer tasks'}
          </p>
        </div>
        {user.role === 'admin' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800"
          >
            {showForm ? '✕ Cancel' : '+ New Task'}
          </button>
        )}
      </div>

      {/* Admin Stats */}
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

      {/* Create Task Form (Admin) */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border p-5 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Create New Task</h2>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <form onSubmit={submit} className="space-y-3">
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
              placeholder="Task title"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Assign to Volunteer (optional)</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                  value={form.volunteer_id}
                  onChange={e => setForm({ ...form, volunteer_id: e.target.value })}
                >
                  <option value="">— Unassigned (Open) —</option>
                  {volunteers.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Due Date</label>
                <input
                  type="date"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                  value={form.due_date}
                  onChange={e => setForm({ ...form, due_date: e.target.value })}
                />
              </div>
            </div>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
              placeholder="Location (optional)"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
            />
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
              placeholder="Task description..."
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
              {loading ? 'Creating...' : 'Create Task'}
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
              filter === s ? 'bg-green-700 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s !== 'all' && STATUS_ICON[s]} {s.replace('_', ' ')} {s !== 'all' && `(${counts[s] || 0})`}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border p-10 text-center text-gray-400">
          <p className="text-4xl mb-2">📌</p>
          <p className="text-sm">No tasks found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => (
            <div key={t.id} className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span>{STATUS_ICON[t.status]}</span>
                    <h3 className="font-semibold text-gray-800">{t.title}</h3>
                    <StatusBadge value={t.status} />
                  </div>

                  {user.role === 'admin' && (
                    <p className="text-xs text-gray-500 mb-1">
                      👤 {t.volunteer_name || <span className="italic">Unassigned</span>}
                    </p>
                  )}
                  {user.role === 'volunteer' && (
                    <p className="text-xs text-gray-500 mb-1">📋 Assigned by: {t.assigned_by_name}</p>
                  )}

                  <p className="text-sm text-gray-600 mt-1">{t.description}</p>

                  <div className="flex gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                    {t.location && <span>📍 {t.location}</span>}
                    {t.due_date && (
                      <span className={new Date(t.due_date) < new Date() && t.status !== 'completed' ? 'text-red-400 font-medium' : ''}>
                        🗓 Due: {new Date(t.due_date).toLocaleDateString()}
                      </span>
                    )}
                    <span>🕐 {new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Status Control */}
                <div className="flex flex-col gap-2 min-w-[140px]">
                  {user.role === 'volunteer' && t.status === 'open' ? (
                    <button
                      onClick={() => takeTask(t.id)}
                      className="bg-green-700 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-800"
                    >
                      ✋ Take Task
                    </button>
                  ) : (
                    <>
                      <label className="text-xs text-gray-500">Update Status</label>
                      <select
                        className="border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-300"
                        value={t.status}
                        onChange={e => updateStatus(t.id, e.target.value)}
                      >
                        {(user.role === 'volunteer' ? VOLUNTEER_STATUSES : STATUSES).map(s => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
