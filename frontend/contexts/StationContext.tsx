import React, { createContext, useContext, useState, ReactNode } from 'react';

export type StationStatus = "EMPTY" | "OCCUPIED" | "FULL" | "OUT_OF_SERVICE";

export interface Station {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  availableBikes: number;
  freeDocks: number;
  status: StationStatus;
  docks?: Dock[];
}

export interface Dock {
  id: string;
  name: string;
  status: string;
  bike?: Bike;
  isInMaintenance?: boolean;
}

export interface Bike {
  id: string;
  type: "STANDARD" | "E_BIKE";
  status: string;
}

interface StationContextType {
  selectedStation: Station | null;
  setSelectedStation: (station: Station | null) => void;
  stations: Station[];
  setStations: (stations: Station[]) => void;
  getFreeDocks: (station: Station) => number;
  getAvailableBikes: (station: Station) => number;
  getCapacity: (station: Station) => number;
}

const StationContext = createContext<StationContextType | undefined>(undefined);

interface StationProviderProps {
  children: ReactNode;
}

export function StationProvider({ children }: StationProviderProps) {
  const [selectedStationState, setSelectedStationState] = useState<Station | null>(null);
  const [stations, setStations] = useState<Station[]>([]);

  const setSelectedStation = (station: Station | null) => {
    console.log("🟢 Context setSelectedStation called with:", station?.name || 'NULL');
    console.trace(); // Shows call stack
    setSelectedStationState(station);
  };

  const getFreeDocks = (station: Station): number => {
    return station.freeDocks;
  };

  const getAvailableBikes = (station: Station): number => {
    return station.availableBikes;
  };

  const getCapacity = (station: Station): number => {
    return station.capacity;
  };

  const value: StationContextType = {
    selectedStation: selectedStationState,
    setSelectedStation,
    stations,
    setStations,
    getFreeDocks,
    getAvailableBikes,
    getCapacity,
  };

  return (
    <StationContext.Provider value={value}>
      {children}
    </StationContext.Provider>
  );
}

export function useStation() {
  const context = useContext(StationContext);
  if (context === undefined) {
    throw new Error('useStation must be used within a StationProvider');
  }
  return context;
}