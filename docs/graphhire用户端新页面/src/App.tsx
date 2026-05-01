/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import JobList from './pages/JobList';
import JobDetail from './pages/JobDetail';
import CompanyList from './pages/CompanyList';
import CompanyDetail from './pages/CompanyDetail';
import Profile from './pages/Profile';
import ResumeManagement from './pages/ResumeManagement';
import ApplicationRecords from './pages/ApplicationRecords';
import Notifications from './pages/Notifications';
import KnowledgeGraph from './pages/KnowledgeGraph';
import PersonalInfo from './pages/PersonalInfo';
import { BottomNav } from './components/BottomNav';
import Navbar from './components/Navbar';

const pageVariants = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 }
};

function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const showBottomNav = ['/', '/jobs', '/companies', '/profile'].includes(location.pathname);

  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-surface-background">
      {!isAuthPage && <Navbar />}
      <main className="flex-1 w-full relative">
        <AnimatePresence mode="wait">
          <Routes location={location}>
            <Route path="/login" element={
              <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <Login />
              </motion.div>
            } />
            <Route path="/register" element={
              <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <Register />
              </motion.div>
            } />
            <Route path="/" element={
              <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <Home />
              </motion.div>
            } />
            <Route path="/jobs" element={
              <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <JobList />
              </motion.div>
            } />
            <Route path="/jobs/:id" element={
              <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <JobDetail />
              </motion.div>
            } />
            <Route path="/companies" element={
              <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <CompanyList />
              </motion.div>
            } />
            <Route path="/companies/:id" element={
              <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <CompanyDetail />
              </motion.div>
            } />
            <Route path="/profile" element={
              <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <Profile />
              </motion.div>
            } />
            <Route path="/resume" element={
              <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <ResumeManagement />
              </motion.div>
            } />
            <Route path="/applications" element={
              <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <ApplicationRecords />
              </motion.div>
            } />
            <Route path="/notifications" element={
              <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <Notifications />
              </motion.div>
            } />
            <Route path="/graph" element={
              <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <KnowledgeGraph />
              </motion.div>
            } />
            <Route path="/personal-info" element={
              <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <PersonalInfo />
              </motion.div>
            } />
          </Routes>
        </AnimatePresence>
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}

import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AnimatedRoutes />
      </Router>
    </ThemeProvider>
  );
}
