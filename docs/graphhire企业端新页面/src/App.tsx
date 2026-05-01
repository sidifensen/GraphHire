/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MobileLayout } from "./components/MobileLayout";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import JobCreate from "./pages/JobCreate";
import JobEdit from "./pages/JobEdit";
import Recommendations from "./pages/Recommendations";
import CandidateDetail from "./pages/CandidateDetail";
import Team from "./pages/Team";
import Messages from "./pages/Messages";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MobileLayout />}>
          <Route path="/" element={<Dashboard />} />
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
