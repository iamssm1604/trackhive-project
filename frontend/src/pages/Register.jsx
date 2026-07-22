import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { Mail, Lock, User, Building, Briefcase, Globe, Copy, Check, Users } from 'lucide-react';

const Register = () => {
  const [mode, setMode] = useState('join'); 

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organizationName: '',
    organizationCode: '',
    domain: '',
    role: 'Developer',
    teamLeaderId: ''
  });
  
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [createdOrgCode, setCreatedOrgCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fetch Team Leaders dynamically when organization code or name changes in 'join' mode
  useEffect(() => {
    const fetchTeamLeaders = async () => {
      if (mode === 'join' && (formData.organizationCode || formData.organizationName)) {
        try {
          const res = await API.get('/users/team-leaders', {
            params: { 
              orgCode: formData.organizationCode, 
              orgName: formData.organizationName 
            }
          });
          setTeamLeaders(res.data);
        } catch (err) {
          setTeamLeaders([]);
        }
      } else {
        setTeamLeaders([]);
      }
    };

    const delayDebounce = setTimeout(fetchTeamLeaders, 500);
    return () => clearTimeout(delayDebounce);
  }, [formData.organizationCode, formData.organizationName, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    const finalData = {
      ...formData,
      role: mode === 'create' ? 'SuperManager' : formData.role,
      isCreatingOrg: mode === 'create',
      teamLeaderId: formData.role === 'Developer' ? formData.teamLeaderId : null
    };

    try {
      const response = await API.post('/users/register', finalData);
      
      if (mode === 'create') {
        const orgCode = response.data.organizationCode;
        setCreatedOrgCode(orgCode);
        setSuccessMessage('Organization created successfully! Save your Organization Code below to share with your team.');
      } else {
        navigate('/login', { state: { message: 'Registration successful! Please wait for SuperManager approval.' } });
      }
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(createdOrgCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-800 p-8 shadow-xl border border-slate-700">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            Join <span className="text-blue-500">TrackHive</span>
          </h1>
          <p className="mt-2 text-slate-400">Get started with your workspace</p>
        </div>

        {createdOrgCode ? (
          <div className="space-y-6 text-center">
            <div className="rounded-lg bg-emerald-500/10 p-4 text-sm text-emerald-400 border border-emerald-500/20">
              {successMessage}
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Your Organization Code</span>
              <div className="mt-2 flex items-center justify-center gap-3">
                <span className="text-3xl font-mono font-bold tracking-widest text-blue-400">{createdOrgCode}</span>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="rounded-lg bg-slate-700 p-2 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
                  title="Copy Code"
                >
                  {copied ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-400">Employees will need this code to register and join your workspace.</p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full rounded-lg bg-blue-600 p-3 text-center font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Proceed to Sign In
            </button>
          </div>
        ) : (
          <>
            <div className="flex rounded-lg bg-slate-700 p-1 mb-6">
              <button
                type="button"
                onClick={() => setMode('join')}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                  mode === 'join' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                Join Organization
              </button>
              <button
                type="button"
                onClick={() => setMode('create')}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                  mode === 'create' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                Create New
              </button>
            </div>

            {error && (
              <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Full Name</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="block w-full rounded-lg border border-slate-600 bg-slate-700 p-2.5 pl-10 text-white focus:border-blue-500 focus:outline-none" placeholder="Your Name" required />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Email Address</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="block w-full rounded-lg border border-slate-600 bg-slate-700 p-2.5 pl-10 text-white focus:border-blue-500 focus:outline-none" placeholder="you@company.com" required />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} className="block w-full rounded-lg border border-slate-600 bg-slate-700 p-2.5 pl-10 text-white focus:border-blue-500 focus:outline-none" placeholder="••••••••" required />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">
                  {mode === 'create' ? 'New Organization Name' : 'Organization Name'}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Building className="h-5 w-5 text-slate-500" />
                  </div>
                  <input type="text" name="organizationName" value={formData.organizationName} onChange={handleChange} className="block w-full rounded-lg border border-slate-600 bg-slate-700 p-2.5 pl-10 text-white focus:border-blue-500 focus:outline-none" placeholder="e.g. Parul Tech" required />
                </div>
              </div>

              {mode === 'create' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">Organization Domain</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Globe className="h-5 w-5 text-slate-500" />
                    </div>
                    <input type="text" name="domain" value={formData.domain} onChange={handleChange} className="block w-full rounded-lg border border-slate-600 bg-slate-700 p-2.5 pl-10 text-white focus:border-blue-500 focus:outline-none" placeholder="e.g. parultech.com" required />
                  </div>
                </div>
              )}

              {mode === 'join' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">Organization Code</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Building className="h-5 w-5 text-slate-500" />
                    </div>
                    <input type="text" name="organizationCode" value={formData.organizationCode} onChange={handleChange} className="block w-full rounded-lg border border-slate-600 bg-slate-700 p-2.5 pl-10 text-white focus:border-blue-500 focus:outline-none" placeholder="e.g. A3F9B2" required />
                  </div>
                </div>
              )}

              {mode === 'join' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">Request Role</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Briefcase className="h-5 w-5 text-slate-500" />
                    </div>
                    <select name="role" value={formData.role} onChange={handleChange} className="block w-full rounded-lg border border-slate-600 bg-slate-700 p-2.5 pl-10 text-white focus:border-blue-500 focus:outline-none appearance-none">
                      <option value="Developer">Developer</option>
                      <option value="Manager">Manager</option>
                      <option value="TeamLeader">TeamLeader</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Dynamic Team Leader selection if user is registering as a Developer */}
              {mode === 'join' && formData.role === 'Developer' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-300">Assign to Team Leader</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Users className="h-5 w-5 text-slate-500" />
                    </div>
                    <select name="teamLeaderId" value={formData.teamLeaderId} onChange={handleChange} className="block w-full rounded-lg border border-slate-600 bg-slate-700 p-2.5 pl-10 text-white focus:border-blue-500 focus:outline-none appearance-none">
                      <option value="">-- Select Team Leader (Optional) --</option>
                      {teamLeaders.map((tl) => (
                        <option key={tl._id} value={tl._id}>{tl.name} ({tl.email})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {mode === 'create' && (
                <div className="p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg text-sm text-blue-300">
                  You will automatically be assigned the <strong>SuperManager</strong> role as the organization creator.
                </div>
              )}

              <button type="submit" disabled={isLoading} className="w-full mt-2 rounded-lg bg-blue-600 p-3 text-center font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none disabled:opacity-50">
                {isLoading ? 'Processing...' : mode === 'create' ? 'Create Organization' : 'Request to Join'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in here</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;