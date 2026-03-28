import React from 'react';
import { Cpu, Activity, Globe, Layout } from 'lucide-react';


// Manually defining the SVGs for Socials so Vite doesn't have to "find" them
const GithubIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
);

const LinkedinIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
);

const TwitterXIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg>
);

const Footer = () => {
  const socialLinks = [
    { Icon: GithubIcon, link: "#" },
    { Icon: LinkedinIcon, link: "#" },
    { Icon: TwitterXIcon, link: "#" }
  ];
  return (
    <footer className="bg-zinc-950 border-t border-white/5 pt-20 pb-10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          
          {/* Logo & About */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6 text-white group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center transition-transform group-hover:rotate-12">
                <Cpu size={18} />
              </div>
              <span className="text-xl font-black italic tracking-tighter">MASTER KERNEL</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs font-medium">
              A high-concurrency CPU scheduling visualizer built with the MERN stack and a custom C++ execution engine.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Navigation</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-medium">
              <li className="hover:text-blue-400 transition-colors cursor-pointer">Home</li>
              <li className="hover:text-blue-400 transition-colors cursor-pointer">Simulator</li>
              <li className="hover:text-blue-400 transition-colors cursor-pointer">Documentation</li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Connect</h4>
            <div className="flex gap-4">
              {socialLinks.map(({ Icon, link }, i) => (
                <a 
                  key={i} 
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600/20 hover:border-blue-500/50 transition-all cursor-pointer"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] uppercase tracking-[0.2em] font-bold text-slate-600">
          <p>© 2026 KUNAL | FULL-STACK DEVELOPER</p>
          <div className="flex items-center gap-2">
            <Activity size={12} className="text-green-500 animate-pulse" />
            <span>SYSTEM STATUS: ALL QUEUES OPTIMIZED</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;