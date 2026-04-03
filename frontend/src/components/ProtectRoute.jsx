import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({children}) =>{


    const isAuthenticated = document.cookie.includes("token=");

    if(!isAuthenticated){
        // If no token, redirect to login page
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;