import React from 'react';

export const ProtectedRoute = ({ children, user, requiredRole = null }) => {
  if (!user) {
    return null; // Will be redirected by App.jsx
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return null; // Will show 403 error
  }

  return children;
};
