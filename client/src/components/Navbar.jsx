import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = {
  admin:       [['Dashboard','/dashboard'],['Users','/users'],['Donations','/donations'],['Requests','/requests'],['Tasks','/tasks']],
  volunteer:   [['Dashboard','/dashboard'],['Tasks','/tasks']],
  donor:       [['Dashboard','/dashboard'],['Donations','/donations']],
  beneficiary: [['Dashboard','/dashboard'],['Requests','/requests']],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="bg-green-700 text-white px-6 py-3 flex items-center justify-between">
      <span className="font-bold text-lg">🌿 CommunityRelief</span>
      <div className="flex gap-4 items-center">
        {(navLinks[user?.role] || []).map(([label, path]) => (
          <Link key={path} to={path} className="hover:underline text-sm">{label}</Link>
        ))}
        <span className="text-xs bg-green-900 px-2 py-1 rounded capitalize">{user?.role}</span>
        <button onClick={handleLogout} className="text-sm bg-red-500 px-3 py-1 rounded hover:bg-red-600">Logout</button>
      </div>
    </nav>
  );
}
