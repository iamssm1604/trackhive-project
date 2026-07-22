import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Issues from './pages/Issues';
import PendingApprovals from './pages/PendingApprovals';
import Teams from './pages/Teams'; // <-- Import Teams page
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/issues" element={<Issues />} />
            <Route path="/approvals" element={<PendingApprovals />} />
            <Route path="/teams" element={<Teams />} /> {/* <-- Add Teams route */}
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}