import React from 'react'
import { Cpu, LayoutDashboard, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';


const Navbar = () =>{
    return (
        <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform">
            <Cpu size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">
            Sched<span className="text-blue-500">Vis</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="text-slate-400 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          
          <div className="h-4 w-px bg-slate-800" /> {/* Divider */}

          <Link to="/login" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
            Login
          </Link>
          
          <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/20">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;