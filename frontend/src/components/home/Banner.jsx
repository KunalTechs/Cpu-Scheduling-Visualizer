import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, GitCommitIcon } from "lucide-react";
import { Link } from 'react-router-dom';
const Banner = () => {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative z-50 w-full"
    >
      {/* Outer Container with dynamic gradient border bottom */}
      <div className="bg-slate-950/80 backdrop-blur-md border-b border-white/10 relative overflow-hidden">
        {/* Animated Shimmer Line */}
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 left-0 w-1/1 h-[1px] bg-gradient-to-r from-transparent via-pink-500 to-transparent"
        />

        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left Side: Feature Tag */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-slate-950" />
              <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-slate-950" />
              <div className="w-6 h-6 rounded-full bg-orange-500 border-2 border-slate-950" />
            </div>
            <p className="text-xs md:text-sm font-medium text-slate-300">
              <span className="text-white font-bold">New:</span> Multilevel
              Queue Simulation is now live!
            </p>
          </div>

         
        </div>
      </div>
    </motion.div>
  );
};

export default Banner;

