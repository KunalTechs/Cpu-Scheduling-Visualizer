import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // We use a status state because we need to wait for the C++ kernel to respond
  const [authStatus, setAuthStatus] = useState("loading"); // 'loading', 'authorized', or 'denied'

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("http://localhost:8081/api/check", {
          method: "GET",
          credentials: "include", 
        });

        if (response.ok) {
          setAuthStatus("authorized");
        } else {
          setAuthStatus("denied");
        }
      } catch (error) {
        console.error("Auth Check Error:", error);
        setAuthStatus("denied");
      }
    };

    checkSession();
  }, []);

  // 1. Show a loader while the C++ backend is verifying the JWT
  if (authStatus === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Verifying_Kernel_Access</p>
        </div>
      </div>
    );
  }

  // 2. If the C++ filter rejected the cookie, send them to Login
  if (authStatus === "denied") {
    return <Navigate to="/login" replace />;
  }

  // 3. If verified, show the Dashboard
  return children;
};

export default ProtectedRoute;