import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import RiderMap from './RiderMap.web';
import OperatorMap from './OperatorMap.web';

export default function MapWeb() {
  const { user } = useAuth();
  
  // TODO: Determine user role from auth context
  const userRole = user?.role || 'rider'; // Default to rider

  if (userRole === 'rider') {
    return <RiderMap />;
  }

  return <OperatorMap />;
}