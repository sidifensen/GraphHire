"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MobileLayout } from "./components/MobileLayout";
import CandidateDetail from "./pages/CandidateDetail";
import Dashboard from "./pages/Dashboard";
import JobCreate from "./pages/JobCreate";
import JobDetail from "./pages/JobDetail";
import JobEdit from "./pages/JobEdit";
import Jobs from "./pages/Jobs";
import Messages from "./pages/Messages";
import Recommendations from "./pages/Recommendations";
import Team from "./pages/Team";

interface EnterpriseMobileAppProps {
  basename?: string;
}

export default function EnterpriseMobileApp({ basename = "/enterprise" }: EnterpriseMobileAppProps) {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route element={<MobileLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/create" element={<JobCreate />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/jobs/:id/edit" element={<JobEdit />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/candidate/:id" element={<CandidateDetail />} />
          <Route path="/team" element={<Team />} />
          <Route path="/messages" element={<Messages />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

