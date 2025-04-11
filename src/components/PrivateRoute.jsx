import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const PrivateRoute = ({ children }) => {
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default PrivateRoute; 