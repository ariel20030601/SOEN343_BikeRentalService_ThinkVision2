export interface StationData {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  availableBikes: number;
  freeDocks: number;
  status: string;
  docks?: {
    id: string;
    name: string;
    status: string;
    bike?: {
      id: string;
      type: "STANDARD" | "E_BIKE";
      status: string;
    };
  }[];
}