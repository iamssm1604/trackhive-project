import { useState, useEffect } from 'react';
import API from '../api/axios';
import { CheckCircle, UserCheck } from 'lucide-react';

export default function PendingApprovals() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchPendingUsers = async () => {
    try {
      const res = await API.get('/users/pending');
      setPendingUsers(res.data);
    } catch (err) {
      setError('Failed to load pending users.');
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId) => {
    try {
      const res = await API.put(`/users/approve/${userId}`);
      setMessage(res.data.msg);
      fetchPendingUsers();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to approve user.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Team Approvals</h1>
        <p className="text-slate-400 mt-1">Manage join requests from developers and team members.</p>
      </div>

      {error && <div className="p-4 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">{error}</div>}
      {message && <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">{message}</div>}

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {pendingUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <UserCheck className="mx-auto h-12 w-12 text-slate-600 mb-3" />
            No pending registration requests found.
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {pendingUsers.map((user) => (
              <div key={user._id} className="p-5 flex items-center justify-between hover:bg-slate-700/50 transition-colors">
                <div>
                  <h3 className="text-white font-medium text-lg">{user.name}</h3>
                  <p className="text-slate-400 text-sm">{user.email}</p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Requested Role: {user.role}
                  </span>
                </div>
                <button
                  onClick={() => handleApprove(user._id)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
                >
                  <CheckCircle className="h-4 w-4" /> Approve
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
