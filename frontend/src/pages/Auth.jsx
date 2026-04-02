import React, { useState, useEffect } from "react"; 
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, ShieldCheck, Zap } from "lucide-react";

const Auth = ({ mode = "login" }) => {
  const [isLogin, setIsLogin] = useState(mode === "login"); 
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
  });

  useEffect(() => {
    setIsLogin(mode === "login");
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Path matches your AuthController routes
    const endpoint = isLogin ? "/login" : "/register";

    try {
      const response = await fetch(`http://localhost:8081${endpoint}`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (response.ok) { 
        window.location.href = "/dashboard";
      } else {
        const errorData = await response.text();
        alert(errorData || "Authentication Failed");
      }
    } catch (error) {
      console.error("Auth Error:", error); 
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden text-white">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-zinc-950/50 backdrop-blur-2xl border border-zinc-800 p-10 rounded-[3rem] shadow-2xl">
          
          <div className="text-center mb-10">
            <motion.div 
              key={isLogin ? "login-icon" : "reg-icon"}
              initial={{ scale: 0.5, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              className="inline-flex p-4 bg-zinc-900 rounded-2xl border border-zinc-800 mb-4 text-blue-500"
            >
              {isLogin ? <ShieldCheck size={32} /> : <Zap size={32} />}
            </motion.div>
            <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">
              {isLogin ? "Kernel " : "Create "}
              <span className="text-blue-500">{isLogin ? "Access" : "Account"}</span>
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* EMAIL - always visible because Login needs it too */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="email"
                required
                placeholder="EMAIL ADDRESS"
                className="w-full bg-black border border-zinc-800 p-4 pl-12 rounded-2xl text-white text-xs font-bold outline-none focus:border-blue-500 transition-all placeholder:text-zinc-700"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            {/* USERNAME - Only show for Registration */}
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative group overflow-hidden"
                >
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="CHOOSE USERNAME"
                    className="w-full bg-black border border-zinc-800 p-4 pl-12 rounded-2xl text-white text-xs font-bold outline-none focus:border-blue-500 transition-all placeholder:text-zinc-700"
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* PASSWORD */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input
                type="password"
                required
                placeholder="PASSWORD"
                className="w-full bg-black border border-zinc-800 p-4 pl-12 rounded-2xl text-white text-xs font-bold outline-none focus:border-blue-500 transition-all placeholder:text-zinc-700"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-white text-black rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all mt-6 shadow-xl active:scale-95"
            >
              {isLogin ? "INITIALIZE SESSION" : "REGISTER USER"}
              <ArrowRight size={16} />
            </button>
          </form>

          <button
            type="button" 
            onClick={() => setIsLogin(!isLogin)} 
            className="w-full mt-8 text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
          >
            {isLogin ? "Don't have an account? Create one" : "Already registered? Sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;