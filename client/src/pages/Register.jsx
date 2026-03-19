import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'donor', phone:'', address:'' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const f = (k, v) => setForm({...form, [k]: v});

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-sm">
        <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">Create Account</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          {[['name','Name'],['email','Email'],['phone','Phone (optional)']].map(([k,p]) => (
            <input key={k} className="w-full border rounded px-3 py-2 text-sm" placeholder={p}
              value={form[k]} onChange={e => f(k, e.target.value)} required={k!=='phone'} />
          ))}
          <input className="w-full border rounded px-3 py-2 text-sm" type="password" placeholder="Password"
            value={form.password} onChange={e => f('password', e.target.value)} required />
          <select className="w-full border rounded px-3 py-2 text-sm" value={form.role} onChange={e => f('role', e.target.value)}>
            <option value="donor">Donor</option>
            <option value="volunteer">Volunteer</option>
            <option value="beneficiary">Beneficiary</option>
          </select>
          <textarea className="w-full border rounded px-3 py-2 text-sm" placeholder="Address (optional)"
            value={form.address} onChange={e => f('address', e.target.value)} rows={2} />
          <button className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 text-sm">Register</button>
        </form>
        <p className="text-center text-sm mt-4">Have account? <Link to="/login" className="text-green-700 underline">Login</Link></p>
      </div>
    </div>
  );
}
