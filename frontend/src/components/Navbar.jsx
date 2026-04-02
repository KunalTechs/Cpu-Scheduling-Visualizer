import React from 'react';
import { Cpu, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8081/logout", {
        method: "GET",
        credentials: "include", 
      });
      if (response.ok) window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
            <Cpu size={20} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white uppercase italic">
            Sched<span className="text-blue-500">Vis</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          {!isDashboard ? (
            <>
              <Link to="/login" className="text-slate-400 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors">
                Login
              </Link>
              <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-sm font-black transition-all shadow-lg shadow-blue-900/20 active:scale-95">
                GET STARTED
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-full border border-slate-800">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Session</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-500 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors group"
              >
                <LogOut size={16} className="group-hover:translate-x-1 transition-transform" /> 
                Terminate
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;