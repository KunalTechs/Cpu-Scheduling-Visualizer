import React from "react";
import { motion } from "framer-motion";

const Banner = () => {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative z-50 w-full"
    >
      <div className="bg-slate-950/80 backdrop-blur-md border-b border-white/10 relative overflow-hidden">
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-pink-500 to-transparent"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-center sm:justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-500 border-2 border-slate-950" />
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 border-2 border-slate-950" />
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-orange-500 border-2 border-slate-950" />
            </div>
            <p className="text-[11px] sm:text-sm font-medium text-slate-300 text-center sm:text-left">
              <span className="text-white font-bold">New:</span> Multilevel Queue Simulation is now live!
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Banner;

