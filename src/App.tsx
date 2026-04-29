/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Workshops from './pages/Workshops';
import WorkshopDetail from './pages/WorkshopDetail';
import CarWash from './pages/CarWash';
import AIChatbot from './components/AIChatbot';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen font-sans text-slate-900 bg-white">
          <Navbar />
          <main className="flex-grow relative">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/workshops" element={<Workshops />} />
              <Route path="/workshops/:id" element={<WorkshopDetail />} />
              <Route path="/carwash" element={<CarWash />} />
              <Route path="/rentals" element={<div className="p-8 text-center text-xl">Rentals (Coming Soon)</div>} />
              <Route path="/imports" element={<div className="p-8 text-center text-xl">Imports (Coming Soon)</div>} />
              <Route path="/admin" element={<div className="p-8 text-center text-xl">Admin Dashboard (Coming Soon)</div>} />
            </Routes>
            <AIChatbot />
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
