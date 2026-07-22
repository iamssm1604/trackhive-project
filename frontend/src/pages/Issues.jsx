import { useState, useEffect } from 'react';
import API from '../api/axios';
import { PlusCircle, MessageSquare } from 'lucide-react';

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('Bug');
  const [commentTexts, setCommentTexts] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchIssues = async () => {
    try {
      const res = await API.get('/issues');
      setIssues(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load issues.');
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await API.post('/issues', { title, description, priority, category });
      setMessage('Issue posted successfully!');
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setCategory('Bug');
      fetchIssues();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create issue.');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await API.put(`/issues/${id}/status`, { status });
      fetchIssues();
    } catch (err) {
      setError('Failed to update status.');
    }
  };

  const handleAddComment = async (issueId) => {
    const text = commentTexts[issueId];
    if (!text || text.trim() === '') return;

    try {
      await API.post(`/issues/${issueId}/comments`, { text });
      setCommentTexts({ ...commentTexts, [issueId]: '' });
      fetchIssues();
    } catch (err) {
      setError('Failed to post comment.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Project Issues & Discussions</h1>
        <p className="text-slate-400 mt-1">Collaborate with your team to discuss and resolve team-wide problems.</p>
      </div>

      {error && <div className="p-4 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">{error}</div>}
      {message && <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">{message}</div>}

      {/* Create Issue Form */}
      <form onSubmit={handleCreateIssue} className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
        <h2 className="text-xl font-semibold text-white">Post a New Issue</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Issue Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="md:col-span-3 rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-white focus:outline-none focus:border-blue-500"
            required
          />
          <textarea
            placeholder="Describe the problem..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="md:col-span-3 rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-white focus:outline-none focus:border-blue-500"
            rows="3"
            required
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="Low">Priority: Low</option>
            <option value="Medium">Priority: Medium</option>
            <option value="High">Priority: High</option>
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="Bug">Category: Bug</option>
            <option value="Task">Category: Task</option>
            <option value="Feature">Category: Feature</option>
          </select>
          <button type="submit" className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            <PlusCircle className="h-5 w-5" /> Post Issue
          </button>
        </div>
      </form>

      {/* Issues List with Discussion Threads */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white">Active Team Discussions</h2>
        {issues.length === 0 ? (
          <p className="text-slate-500 italic">No issues found.</p>
        ) : (
          issues.map((issue) => (
            <div key={issue._id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-lg font-bold text-white">{issue.title}</h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                      issue.priority === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      issue.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {issue.priority}
                    </span>
                    <span className="text-xs px-2.5 py-1 bg-slate-700 text-slate-300 rounded-full font-semibold">
                      {issue.category}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm">{issue.description}</p>
                  <div className="text-xs text-slate-500 flex gap-4 flex-wrap">
                    <span>Raised by: <strong className="text-slate-300">{issue.raisedBy?.name || 'Unknown'}</strong></span>
                    <span>Created: {new Date(issue.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Status Control */}
                <div className="flex items-center gap-2">
                  <select
                    value={issue.status}
                    onChange={(e) => handleStatusUpdate(issue._id, e.target.value)}
                    className="rounded-lg border border-slate-600 bg-slate-700 p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Open">Open</option>
                    <option value="InProgress">InProgress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Discussion / Comments Section */}
              <div className="pt-4 border-t border-slate-700 space-y-3">
                <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-400" /> Team Discussion ({issue.comments?.length || 0})
                </h4>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {issue.comments && issue.comments.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No discussion replies yet. Be the first to reply!</p>
                  ) : (
                    issue.comments?.map((comment) => (
                      <div key={comment._id} className="bg-slate-900/60 p-3 rounded-lg text-sm space-y-1 border border-slate-700/40">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-blue-400">{comment.user?.name || 'Team Member'}</span>
                          <span className="text-slate-500">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-slate-300">{comment.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Contribute to the team discussion or solution..."
                    value={commentTexts[issue._id] || ''}
                    onChange={(e) => setCommentTexts({ ...commentTexts, [issue._id]: e.target.value })}
                    className="flex-1 rounded-lg border border-slate-600 bg-slate-700 p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddComment(issue._id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}