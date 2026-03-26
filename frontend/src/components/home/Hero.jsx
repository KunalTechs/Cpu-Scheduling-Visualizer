import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Cpu, Activity } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden bg-slate-950">
      {/* --- SUN / LAMP RAY BACKGROUND --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* The "Sun" Source (Top Right) */}
        <motion.div
          animate={{
            opacity: [0.4, 0.6, 0.4],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full"
        />

        {/* The "God Ray" Beam */}
        <motion.div
          initial={{ rotate: -45, opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute -top-[20%] right-[5%] w-[1000px] h-[600px] origin-top-right overflow-hidden"
          style={{
            background:
              "conic-gradient(from 225deg at 100% 0%, transparent 0deg, rgba(99, 102, 241, 0.15) 20deg, transparent 40deg)",
            filter: "blur(60px)",
          }}
        >
          {/* Shimmer Effect inside the beam */}
          <motion.div
            animate={{ x: [-500, 500] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent"
          />
        </motion.div>

        {/* Secondary Soft Ambient Light (Bottom Left) */}
        <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
            <Activity size={14} className="animate-pulse" /> System Active
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] text-white tracking-tighter">
            Visualize <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-500">
              The Master Kernel
            </span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-lg leading-relaxed font-medium">
            Next-gen CPU scheduling analysis. Experience real-time process
            management powered by a high-concurrency C++ engine.
          </p>

          <div className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className="px-10 py-5 bg-white text-slate-950 hover:bg-indigo-500 hover:text-white rounded-2xl font-black text-xl transition-all shadow-2xl shadow-white/5 group"
            >
              Start Simulation
            </Link>
            <button className="text-white font-bold flex items-center gap-2 hover:text-indigo-400 transition-colors">
              Docs <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>

        {/* Right Side: Animated Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          {/* Glassmorphism Card with Inner Glow */}
          <div className="relative z-10 p-1 bg-gradient-to-br from-white/20 to-transparent rounded-[2.5rem] backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_-12px_rgba(99,102,241,0.3)]">
            <div className="bg-slate-950/90 rounded-[2.3rem] p-12 flex flex-col items-center border border-white/5">
              <Cpu
                size={120}
                className="text-indigo-500 mb-8 filter drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]"
              />
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [10, 40, 10], opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="w-2 bg-indigo-500 rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
