import { useAuth } from '@/contexts/AuthContext';
import { reserveBike, checkoutBike, returnBike } from '@/api/auth/bmsAPI';
import { getTripSummary } from '@/api/auth/prcAPI';
import { StationData } from '@/types/station';
import { TripSummaryDTO } from '@/api/auth/histAPI';

export function useBikeOperations(
  bikeState: ReturnType<typeof import('./useBikeState').useBikeState>,
  onStationsRefresh: () => Promise<void>
) {
  const { user } = useAuth();

  const getRiderId = () => 
    (user as any)?.id ?? (user as any)?.userId ?? (user as any)?.sub ?? 1;

  const handleReserveBike = async (station: StationData, bikeId: string) => {
    const riderId = getRiderId();
    try {
      console.log('Reserving bike:', { riderId, stationId: station.id, bikeId });
      await reserveBike(riderId, station.id, bikeId);
      bikeState.setHasReservedBike(true);
      bikeState.setReservedBikeId(bikeId);
      console.log('Success', 'Bike reserved successfully');
    } catch (err) {
      console.error('Reserve error:', err);
      throw err;
    }
  };

  const handleCheckoutBike = async (station: StationData, bikeId?: string) => {
    const riderId = getRiderId();

    let finalBikeId: string;
    if (bikeState.hasReservedBike && bikeState.reservedBikeId) {
      const reservedBikeDock = station.docks?.find(d => d.bike?.id === bikeState.reservedBikeId);
      if (!reservedBikeDock) {
        throw new Error('Your reserved bike is not at this station');
      }
      finalBikeId = bikeState.reservedBikeId;
    } else {
      if (!bikeId) {
        throw new Error('Please select a bike to checkout');
      }
      const selectedDock = station.docks?.find(d => d.bike?.id === bikeId);
      if (!selectedDock?.bike) {
        throw new Error('Selected bike not found');
      }
      if (selectedDock.bike.status === 'RESERVED') {
        throw new Error('This bike is reserved by another rider');
      }
      finalBikeId = bikeId;
    }

    try {
      const trip = await checkoutBike(riderId, station.id, finalBikeId);
      
      bikeState.setHasReservedBike(false);
      bikeState.setReservedBikeId(null);
      bikeState.setHasCheckoutBike(true);
      bikeState.setCheckoutBikeId(finalBikeId);
      bikeState.setCurrentTripId(trip.id);
      
      await onStationsRefresh();
      console.log('Success', 'Bike checked out successfully');
    } catch (err) {
      console.error('Checkout error:', err);
      throw err;
    }
  };

  const handleReturnBike = async (
    station: StationData,
    bikeId: string
  ): Promise<TripSummaryDTO | null> => {
    const riderId = getRiderId();
    
    try {
      await returnBike(riderId, station.id, bikeId);

      bikeState.setHasCheckoutBike(false);
      bikeState.setCheckoutBikeId(null);

      let summary: TripSummaryDTO | null = null;
      
      if (bikeState.currentTripId) {
        try {
          summary = await getTripSummary(bikeState.currentTripId);
          bikeState.setCurrentTripId(null);
        } catch (err) {
          console.error('Failed to fetch trip summary:', err);
        }
      }
      
      await onStationsRefresh();
      return summary;
    } catch (err) {
      console.error('Return error:', err);
      throw err;
    }
  };

  return {
    handleReserveBike,
    handleCheckoutBike,
    handleReturnBike,
  };
}