import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const Complaints = () => {
  // Directly redirects as requested by endpoint constraints
  return <Navigate to="/student/login" replace />;
};

export default Complaints;
