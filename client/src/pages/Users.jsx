import { useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'

const ROLES = ['admin', 'volunteer', 'donor', 'beneficiary']

const ROLE_ICON = { admin: '🛡️', volunteer: '🤝', donor: '💰', beneficiary: '🙏' }

export default function Users() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const load = () => api.get('/admin/users').then(r => setUsers(r.data))
  useEffect(() => { load() }, [])

  const updateRole = async (id, role) => {
    await api.put(`/admin/users/${id}/role`, { role })
    load()
  }

  const deleteUser = async id => {
    await api.delete(`/admin/users/${id}`)
    setConfirmDelete(null)
    load()
  }

  const counts = ROLES.reduce((acc, r) => {
    acc[r] = users.filter(u => u.role === r).length
    return acc
  }, {})

  const filtered = users.filter(u => {
    const matchRole = filter === 'all' || u.role === filter
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage all registered users and their roles</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {ROLES.map(r => (
          <div key={r} className="bg-white rounded-xl border p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span>{ROLE_ICON[r]}</span>
              <p className="text-xs text-gray-500 capitalize">{r}s</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">{counts[r] || 0}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-green-300"
          placeholder="🔍 Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          {['all', ...ROLES].map(r => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                filter === r ? 'bg-green-700 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
              }`}
            >
              {r !== 'all' && ROLE_ICON[r]} {r} {r !== 'all' && `(${counts[r] || 0})`}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <p className="text-4xl mb-2">👥</p>
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-left">
              <tr>
                {['Name', 'Email', 'Phone', 'Role', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className={`border-t hover:bg-gray-50 ${u.id === user.id ? 'bg-green-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-xs">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800">
                        {u.name} {u.id === user.id && <span className="text-xs text-green-600">(you)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3 text-gray-500">{u.phone || '—'}</td>
                  <td className="px-4 py-3">
                    {u.id === user.id ? (
                      <StatusBadge value={u.role} />
                    ) : (
                      <select
                        className="border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-300"
                        value={u.role}
                        onChange={e => updateRole(u.id, e.target.value)}
                      >
                        {ROLES.map(r => (
                          <option key={r} value={r}>{ROLE_ICON[r]} {r}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {u.id !== user.id && (
                      confirmDelete === u.id ? (
                        <div className="flex gap-2 items-center">
                          <span className="text-xs text-gray-500">Sure?</span>
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(u.id)}
                          className="text-xs text-red-500 hover:text-red-700 hover:underline"
                        >
                          🗑 Delete
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-3">
        Showing {filtered.length} of {users.length} users
      </p>
    </div>
  )
}
