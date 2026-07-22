import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function DashboardLayout() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      <aside className="w-64 bg-slate-800 border-r border-slate-700 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-500 mb-6">TrackHive</h2>
          <nav className="space-y-2">
            <Link to="/issues" className="block px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">Issues</Link>
            <Link to="/approvals" className="block px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">Team Approvals</Link>
            <Link to="/teams" className="block px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">Teams</Link> {/* <-- Add link here */}
          </nav>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} className="text-red-400 hover:text-red-300 text-left">
          Log Out
        </button>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}