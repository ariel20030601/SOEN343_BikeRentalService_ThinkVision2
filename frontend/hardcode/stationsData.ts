export interface StationData {
    id: string;
    title: string;
    bikes: string;
    ebikes: string;
    docks: string;
    location: {
        lat: number;
        lng: number;
    };
    address: string;
    capacity: number; // Total dock capacity
    status: 'operational' | 'out_of_service' | 'maintenance';
}

export const STATIONS_DATA: StationData[] = [
    {
        id: "1", 
        title: "Station 1", 
        bikes: "13", 
        ebikes: "0", 
        docks: "10",
        location: { lat: 45.4948, lng: -73.5779 },
        address: "Concordia University SGW Campus",
        capacity: 23, // 13 bikes + 10 free docks
        status: 'operational'
    },
    {
        id: "2", 
        title: "Station 2", 
        bikes: "10", 
        ebikes: "5", 
        docks: "0",
        location: { lat: 45.4581, lng: -73.6391 }, 
        address: "Concordia University Loyola Campus",
        capacity: 15, 
        status: 'operational'
    },
    {
        id: "3", 
        title: "Station 3", 
        bikes: "3", 
        ebikes: "0", 
        docks: "17",
        location: { lat: 45.5075, lng: -73.5643 }, 
        address: "Complexe Desjardins",
        capacity: 20,
        status: 'operational'
    }
];