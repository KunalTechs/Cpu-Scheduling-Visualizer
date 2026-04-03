import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Cpu, Activity } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    // Changed bg-slate-950 to bg-black
    <section className="relative pt-32 pb-24 overflow-hidden bg-black min-h-[90vh] flex items-center">
      
      {/* --- ALL LIGHT EFFECTS REMOVED --- */}
      <div className="absolute inset-0 z-0 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
            <Activity size={14} className="animate-pulse" /> System Active
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] text-white tracking-tighter italic">
            Visualize <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-blue-500">
              The Master Kernel
            </span>
          </h1>

          <p className="text-zinc-500 text-lg md:text-xl mb-12 max-w-lg leading-relaxed font-medium">
            Next-gen CPU scheduling analysis. Experience real-time process
            management powered by a high-concurrency C++ engine.
          </p>

          <div className="flex items-center gap-6">
            <Link
              to="/register"
              className="px-10 py-5 bg-white text-black hover:bg-blue-600 rounded-2xl font-black text-xl transition-all active:scale-95 shadow-xl shadow-white/5"
            >
              Start Simulation
            </Link>
          </div>
        </motion.div>

        {/* Right Side: Animated Card (Floating in the Void) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          {/* Card Wrapper with very subtle zinc border */}
          <div className="relative z-10 p-[1px] bg-zinc-800 rounded-[2.5rem]">
            <div className="bg-black rounded-[2.4rem] p-12 flex flex-col items-center border border-white/5">
              <Cpu
                size={120}
                className="text-white mb-8"
              />
              <div className="flex gap-2 h-10 items-end">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [10, 40, 10], opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                    className="w-2.5 bg-gradient-to-t from-red-600 via-pink-500 to-blue-500 rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Shadow beneath the card to give it depth in the black void */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-1/2 h-10 bg-white/5 blur-3xl rounded-full" />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;