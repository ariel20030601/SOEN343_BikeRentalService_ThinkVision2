const STORAGE_KEYS = {
  HAS_RESERVED: 'bibixi_has_reserved_bike',
  RESERVED_BIKE_ID: 'bibixi_reserved_bike_id',
  HAS_CHECKOUT: 'bibixi_has_checkout_bike',
  CHECKOUT_BIKE_ID: 'bibixi_checkout_bike_id',
  CURRENT_TRIP_ID: 'bibixi_current_trip_id',
};

export interface BikeState {
  hasReservedBike: boolean;
  reservedBikeId: string | null;
  hasCheckoutBike: boolean;
  checkoutBikeId: string | null;
  currentTripId: number | null;
}

export const bikeStorage = {
  save: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Failed to save to storage:', e);
    }
  },

  load: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Failed to load from storage:', e);
      return null;
    }
  },

  clear: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  },

  loadBikeState: (): BikeState => ({
    hasReservedBike: bikeStorage.load(STORAGE_KEYS.HAS_RESERVED) || false,
    reservedBikeId: bikeStorage.load(STORAGE_KEYS.RESERVED_BIKE_ID),
    hasCheckoutBike: bikeStorage.load(STORAGE_KEYS.HAS_CHECKOUT) || false,
    checkoutBikeId: bikeStorage.load(STORAGE_KEYS.CHECKOUT_BIKE_ID),
    currentTripId: bikeStorage.load(STORAGE_KEYS.CURRENT_TRIP_ID),
  }),

  saveBikeState: (state: Partial<BikeState>) => {
    if (state.hasReservedBike !== undefined) {
      bikeStorage.save(STORAGE_KEYS.HAS_RESERVED, state.hasReservedBike);
    }
    if (state.reservedBikeId !== undefined) {
      bikeStorage.save(STORAGE_KEYS.RESERVED_BIKE_ID, state.reservedBikeId);
    }
    if (state.hasCheckoutBike !== undefined) {
      bikeStorage.save(STORAGE_KEYS.HAS_CHECKOUT, state.hasCheckoutBike);
    }
    if (state.checkoutBikeId !== undefined) {
      bikeStorage.save(STORAGE_KEYS.CHECKOUT_BIKE_ID, state.checkoutBikeId);
    }
    if (state.currentTripId !== undefined) {
      bikeStorage.save(STORAGE_KEYS.CURRENT_TRIP_ID, state.currentTripId);
    }
  },
};