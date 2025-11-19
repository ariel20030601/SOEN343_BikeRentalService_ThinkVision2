import { useState, useEffect } from 'react';
import { bikeStorage, BikeState } from '@/utils/bikeStorage';

export function useBikeState() {
  const [state, setState] = useState<BikeState>(() => bikeStorage.loadBikeState());

  // Auto-save to storage whenever state changes
  useEffect(() => {
    bikeStorage.saveBikeState(state);
  }, [state]);

  const setHasReservedBike = (value: boolean) => 
    setState(prev => ({ ...prev, hasReservedBike: value }));
  
  const setReservedBikeId = (value: string | null) => 
    setState(prev => ({ ...prev, reservedBikeId: value }));
  
  const setHasCheckoutBike = (value: boolean) => 
    setState(prev => ({ ...prev, hasCheckoutBike: value }));
  
  const setCheckoutBikeId = (value: string | null) => 
    setState(prev => ({ ...prev, checkoutBikeId: value }));
  
  const setCurrentTripId = (value: number | null) => 
    setState(prev => ({ ...prev, currentTripId: value }));

  const clearState = () => {
    bikeStorage.clear();
    setState({
      hasReservedBike: false,
      reservedBikeId: null,
      hasCheckoutBike: false,
      checkoutBikeId: null,
      currentTripId: null,
    });
  };

  return {
    ...state,
    setHasReservedBike,
    setReservedBikeId,
    setHasCheckoutBike,
    setCheckoutBikeId,
    setCurrentTripId,
    clearState,
  };
}