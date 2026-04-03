import React from "react";
import { Routes, Route } from "react-router-dom"; // Don't import 'Router' here
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectRoute";

const App = () => {
  return (
    /* No <Router> tag here! It's already in main.jsx */
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-blue-500/30">
      <Navbar />

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/register" element={<Auth mode="register" />} />

        {/* SECURE */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
             <Dashboard />
          </ProtectedRoute>
           } />
      </Routes>
    </div>
  );
};

export default App;
