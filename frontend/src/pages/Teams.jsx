import { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Users, UserPlus, Shield } from 'lucide-react';

export default function Teams() {
  const { user } = useContext(AuthContext); // Access current logged-in user profile
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [selectedLeader, setSelectedLeader] = useState('');
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [availableDevs, setAvailableDevs] = useState([]);
  const [selectedDevs, setSelectedDevs] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchTeams = async () => {
    try {
      const res = await API.get('/teams');
      setTeams(res.data);
    } catch (err) {
      setError('Failed to load teams.');
    }
  };

  const fetchTeamLeaders = async () => {
    try {
      const res = await API.get('/users/approved-team-leaders');
      setTeamLeaders(res.data);
    } catch (err) {
      console.error('Failed to load team leaders', err);
    }
  };

  const fetchAvailableDevelopers = async () => {
    try {
      const res = await API.get('/teams/available-developers');
      setAvailableDevs(res.data);
    } catch (err) {
      console.error('Failed to load developers', err);
    }
  };

  useEffect(() => {
    fetchTeams();
    if (user?.role === 'SuperManager' || user?.role === 'Manager') {
      fetchTeamLeaders();
    }
    fetchAvailableDevelopers();
  }, [user]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await API.post('/teams/create', { name: teamName, teamLeaderId: selectedLeader });
      setMessage(res.data.msg);
      setTeamName('');
      setSelectedLeader('');
      fetchTeams();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create team.');
    }
  };

  const handleAddMember = async (teamId) => {
    const developerId = selectedDevs[teamId];
    if (!developerId) return;

    setError('');
    setMessage('');
    try {
      const res = await API.put('/teams/add-member', { teamId, developerId });
      setMessage(res.data.msg);
      setSelectedDevs({ ...selectedDevs, [teamId]: '' });
      fetchTeams();
      fetchAvailableDevelopers();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to add member.');
    }
  };

  // If user is a TeamLeader, filter teams to only show the team they lead
// If user is a TeamLeader, filter teams to show the team where they are the teamLeaderId
  const displayedTeams = user?.role === 'TeamLeader'
    ? teams.filter(team => {
        const tlId = team.teamLeaderId?._id || team.teamLeaderId;
        return tlId?.toString() === user.id?.toString();
      })
    : teams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Organization Teams</h1>
        <p className="text-slate-400 mt-1">
          {user?.role === 'TeamLeader' ? 'Manage your team members.' : 'Manage teams, assign Team Leaders, and group developers.'}
        </p>
      </div>

      {error && <div className="p-4 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">{error}</div>}
      {message && <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">{message}</div>}

      {/* Create Team Form - ONLY visible to SuperManager / Manager */}
      {(user?.role === 'SuperManager' || user?.role === 'Manager') && (
        <form onSubmit={handleCreateTeam} className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
          <h2 className="text-xl font-semibold text-white">Create New Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Team Name (e.g. Core API Team)"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-white focus:outline-none focus:border-blue-500"
              required
            />
            <select
              value={selectedLeader}
              onChange={(e) => setSelectedLeader(e.target.value)}
              className="rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-white focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">Select Team Leader</option>
              {teamLeaders.map((tl) => (
                <option key={tl._id} value={tl._id}>{tl.name} ({tl.email})</option>
              ))}
            </select>
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            Create Team
          </button>
        </form>
      )}

      {/* Teams List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayedTeams.map((team) => (
          <div key={team._id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-white">{team.name}</h3>
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-semibold">
                <Shield className="h-3.5 w-3.5" /> TL: {team.teamLeaderId?.name || 'Unassigned'}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-400 mb-2">Team Members ({team.members?.length || 0})</h4>
              {team.members?.length === 0 ? (
                <p className="text-sm text-slate-500 italic mb-3">No members added yet.</p>
              ) : (
                <ul className="space-y-2 mb-3">
                  {team.members.map((member) => (
                    <li key={member._id} className="text-sm text-slate-300 bg-slate-900/50 p-2 rounded flex justify-between">
                      <span>{member.name}</span>
                      <span className="text-xs text-slate-500">{member.email}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Add Member Section */}
            <div className="pt-3 border-t border-slate-700 flex gap-2">
              <select
                value={selectedDevs[team._id] || ''}
                onChange={(e) => setSelectedDevs({ ...selectedDevs, [team._id]: e.target.value })}
                className="flex-1 rounded-lg border border-slate-600 bg-slate-700 p-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select developer to add...</option>
                {availableDevs.map((dev) => (
                  <option key={dev._id} value={dev._id}>{dev.name} ({dev.email})</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleAddMember(team._id)}
                className="flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <UserPlus className="h-4 w-4" /> Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}