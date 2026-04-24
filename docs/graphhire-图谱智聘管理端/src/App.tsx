/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import CompanyAudit from './pages/CompanyAudit';
import TagManagement from './pages/TagManagement';
import TaskMonitoring from './pages/TaskMonitoring';
import Login from './pages/Login';
import Layout from './components/Layout';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Testing with authenticated true

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/companies" element={<CompanyAudit />} />
            <Route path="/tags" element={<TagManagement />} />
            <Route path="/tasks" element={<TaskMonitoring />} />
            <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

