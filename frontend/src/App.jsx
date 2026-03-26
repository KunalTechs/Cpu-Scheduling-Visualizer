import React from "react";
import { Routes, Route } from "react-router-dom"; // Don't import 'Router' here
import Navbar from "./components/Navbar";
import Home from "./pages/Home";




const App = () => {
  return (
    /* No <Router> tag here! It's already in main.jsx */
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-blue-500/30">
       <Navbar/>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<div className="p-20 text-center text-4xl font-bold">Simulator</div>} />
      </Routes>
    </div>
  );
};

export default App;