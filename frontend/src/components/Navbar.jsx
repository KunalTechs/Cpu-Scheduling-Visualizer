import React, { useState } from 'react';
import { Cpu, LogOut, ShieldCheck, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { API_BASE } from "../config";

const Navbar = () => {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE}/logout`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
            <Cpu size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg sm:text-xl tracking-tight text-white uppercase italic">
            Sched<span className="text-blue-500">Vis</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden sm:flex items-center gap-6">
          {!isDashboard ? (
            <>
              <Link to="/login" className="text-zinc-400 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors">
                Login
              </Link>
              <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-sm font-black transition-all shadow-lg shadow-blue-900/20 active:scale-95">
                GET STARTED
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-full border border-zinc-800">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Secure Session</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-zinc-400 hover:text-red-500 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors group"
              >
                <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                Terminate
              </button>
            </>
          )}
        </div>

        {/* Mobile Nav */}
        <div className="sm:hidden flex items-center gap-3">
          {isDashboard ? (
            <button
              onClick={handleLogout}
              className="text-zinc-400 hover:text-red-500 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest transition-colors"
            >
              <LogOut size={15} /> Exit
            </button>
          ) : (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-zinc-400 hover:text-white transition-colors p-1"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && !isDashboard && (
        <div className="sm:hidden border-t border-zinc-800 bg-black px-4 py-4 flex flex-col gap-3">
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="text-zinc-400 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors py-2"
          >
            Login
          </Link>
          <Link
            to="/register"
            onClick={() => setMenuOpen(false)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl text-sm font-black transition-all text-center"
          >
            GET STARTED
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;