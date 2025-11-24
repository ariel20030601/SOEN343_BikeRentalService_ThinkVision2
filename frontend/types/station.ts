export type StationStatus = "EMPTY" | "OCCUPIED" | "FULL" | "OUT_OF_SERVICE";

export interface Bike {
  id: string;
  type: "STANDARD" | "E_BIKE";
  status: string;
}

export interface Dock {
  id: string;
  name: string;
  status: string;
  bike?: Bike;
}

export interface StationData {
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